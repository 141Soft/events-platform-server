import { db } from '../db.js'

export const insertEvent = async (event, path) => {

    let connection;

    try {
        connection = await db.pool.getConnection();

        const query = `
            INSERT INTO events (eventName, eventDate, eventDesc, eventStub, eventThumb, eventDuration)
            VALUES (?,?,?,?,?,?);
        `
        const values = [event.eventName, event.eventDate, event.eventDesc, event.eventStub, path, event.eventDuration];

        let [result] = await connection.query(query, values);

        return result.insertId;
    } catch(err) {
        throw err;
    } finally {
        if(connection){ connection.release(); }
    };
}

export const insertTags = async (id, tags) => {
    let connection;

    try{

        connection = await db.pool.getConnection();

        const query = `
            INSERT INTO eventTags (eventID, eventTag)
            VALUES ? ;
        `;

        const tagArr = tags.split(',');

        const values = tagArr.map(tag => [id, tag]);
        
        const [result] = await connection.query(query, [values]);

        return result;
    } catch (err) {
        throw err;
    } finally {
        if(connection){ connection.release(); }
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
            query += `WHERE ${conditions.join(' AND ')}`;
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
            let countQuery = `
                SELECT COUNT(DISTINCT e.id) as totalCount
                FROM events e
                LEFT JOIN eventTags et ON e.id = et.eventID
            `;
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

export const updateEventParticipants = async (eventID, userEmail) => {
    let connection;
    try {
        connection = await db.pool.getConnection()

        const query = `
            INSERT INTO eventParticipants
            (eventID, userEmail)
            VALUES(?, ?);
        `
        const params = [eventID, userEmail];

        const [result] = await connection.query(query, params);
        return result;
    } catch(err) {
        throw err;
    } finally {
        if(connection) { connection.release(); }
    };
}

export const fetchUserEvents = async (userEmail) => {
    let connection;
    try{
        connection = await db.pool.getConnection();

        const idQuery = `
            SELECT * FROM eventParticipants
            WHERE userEmail = ?;
        `

        const idParams = [userEmail]

        const [idResult] = await connection.query(idQuery, idParams);
        if(idResult.length === 0){
            return idResult;
        };

        const ids = idResult.map((e) => e = e.eventID);

        const placeholders = ids.map((id) => id = '?').join(',');

        const eventsQuery = `
            SELECT e.*, GROUP_CONCAT(et.eventTag SEPARATOR ',') AS tags
            FROM events e
            LEFT JOIN eventTags et ON e.id = et.eventID
            WHERE id IN (${placeholders});
        `;

        // const eventsQuery = `
        //     SELECT * FROM events
        //     WHERE id IN (${placeholders});
        // `
        const [eventResult] = await connection.query(eventsQuery, ids);

        for(const event of eventResult){
            event.tags = event.tags.split(',');
        };

        return eventResult;

    } catch(err) {
        throw err;
    } finally {
        if(connection) { connection.release(); }
    };
};