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
        console.error(error);
        throw error;
    } finally {
        if(connection) { connection.release(); }
    }
}

// seachParams object takes: id, tag, name, paginate, page, limit
// Needs date parsing and filtering by date
// Investigate how much of the filtering can be moved to the SQL query
export const fetchEvents = async(searchParams) => {

    let connection;

    try {
        connection = await db.pool.getConnection();

        let [result] = await connection.query(`
            SELECT e.*, et.eventTag AS tag
            FROM events e
            LEFT JOIN eventTags et ON e.id = et.eventID
            `);

        if(searchParams?.id){
            const id = parseInt(searchParams.id);
            result = result.filter(e => e.id === id);
            if(result.length === 0){ return false }
        }
        if(searchParams?.name){
            result = result.filter(e => e.eventName.toLowerCase().includes(searchParams.name.toLowerCase()))
            if(result.length === 0){ return false }
        }
        if(searchParams?.tag){
            result = result.filter(e => e.tag === searchParams.tag)
            if(result.length === 0){ return false }
        }

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
        console.error('Error fetching events:', error);
        throw error;
    } finally {
        if(connection) { connection.release(); }
    }
}