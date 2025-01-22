import { db } from '../db.js'

export const insertEvent = async (name, date, desc, stub, thumb, imgarray, tagarray) => {

    let id;
    let connection;

    try {
        connection = await db.pool.getConnection();
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO events (eventName, eventDate, eventDesc, eventStub, eventThumb) VALUES(?, ?, ?, ?, ?)',
            [name, date, desc, stub, thumb]);
        id = result.insertId;

        for(const tag of tagarray) {
            await connection.query(
                'INSERT INTO eventTags (eventID, eventTag) VALUES (?, ?)',
                [id, tag]
            );
        }

        for(const img of imgarray) {
            await connection.query(
                'INSERT INTO eventImages (eventID, imgurl) VALUES (?, ?)',
                [id, img]
            );
        }

        await connection.commit();

    } catch(error) {
        if(connection){ await connection.rollback(); }
        throw error;
    } finally {
        if(connection) { connection.release(); }
    }
}

// seachParams object takes: id, tag, name, paginate, page, limit
// Needs date parsing and filtering by date
export const fetchEvents = async(searchParams) => {

    let connection;

    try {
        connection = await db.pool.getConnection();

        let query = `
            SELECT e.*, et.eventTag AS tag
            FROM events e
            LEFT JOIN eventTags et ON e.id = et.eventID
        `;

        let conditions = [];
        let params = [];

        if(searchParams?.id){
            conditions.push('e.id = ?');
            params.push(parseInt(searchParams.id));
        }
        if(searchParams?.name){
            conditions.push('LOWER(e.eventName) LIKE ?');
            params.push(`%${searchParams.name.toLowerCase()}%`);
        }
        if(searchParams?.tag){
            conditions.push('et.eventTag = ?');
            params.push(searchParams.tag);
        }
        if(conditions.length > 0){
            query+= ` WHERE ${conditions.join(' AND ')}`;
        }

        let [result] = await connection.query(query, params);

        const groupedEvents = new Map();

        for(const event of result){
            if(!groupedEvents.has(event.id)) {
                const newEvent = { ...event, tags: [event.tag] };
                delete newEvent.tag;
                groupedEvents.set(event.id, newEvent);
            } else {
                const matchEvent = groupedEvents.get(event.id);
                matchEvent.tags.push(event.tag);
            }
        }

        if(searchParams?.paginate){
            let eventsArr = Array.from(groupedEvents.values());
            const page = parseInt(searchParams.page) || 1;
            const limit = parseInt(searchParams.limit) || 10;
            const start = (page - 1) * limit;
            const end = start + limit;
            const count = eventsArr.length;
            const totalPages = Math.ceil(count / limit);
            const paginatedEvents = eventsArr.slice(start, end);

            return {
                events: paginatedEvents,
                pagination: { page, limit, count, totalPages }
            }
        } else {
            return{
                events: Array.from(groupedEvents.values())
            } 
        }
    } catch(error) {
        throw error;
    } finally {
        if(connection) { connection.release(); }
    }
}