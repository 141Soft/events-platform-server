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

    } catch(err) {
        if(connection){ await connection.rollback(); }
        console.error(err);
        throw err;
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
            SELECT e.*, GROUP_CONCAT(et.eventTag SEPARATOR ',') AS tags
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
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ' GROUP BY e.id'

        if(searchParams?.paginate){
            const page = parseInt(searchParams.page) || 1;
            const limit = parseInt(searchParams.limit) || 10;
            const offset = (page - 1) * limit;

            query += ' LIMIT ? OFFSET ?';
            params.push(limit, offset)
        }

        let [result] = await connection.query(query, params);

        for(const event of result){
            event.tags = event.tags.split(',');
        }

        if(searchParams?.paginate){
            let countQuery = 'SELECT COUNT(DISTINCT e.id) as totalCount FROM events e';
            if(conditions.length > 0){
                countQuery += ` WHERE ${conditions.join(' AND ')}`;
            }
            const [countResult] = await connection.query(countQuery, params.slice(0, conditions.length));
            const count = countResult[0].totalCount;
            const totalPages = Math.ceil(count / (searchParams?.limit || 10));

            return {
                events: result,
                pagination: {
                    page: parseInt(searchParams.page) || 1,
                    limit: parseInt(searchParams.limit) || 10,
                    count,
                    totalPages
                }
            }
        } else {
            return {
                events: result
            }
        }
    } catch(err) {
        console.error('Error fetching events:', err);
        throw err;
    } finally {
        if(connection) { connection.release(); }
    }
}

export const fetchTags = async() => {

    let connection;

    try{
        connection = await db.pool.getConnection();

        let [result] = await connection.query(`
            SELECT DISTINCT eventTag FROM eventTags;
        `)

        const tags = result.map((tag) => tag = tag.eventTag);
        return { tags };
    } catch(err) {
        throw err;
    } finally {
        if(connection) { connection.release(); }
    }   
}