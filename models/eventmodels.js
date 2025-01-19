import { db } from '../db.js'

//This needs more robust error handling, should validate arguments
const postEvent = async (name, date, desc, imgarray, tagarray) => {

    let id;
    let connection;

    try {
        connection = await db.pool.getConnection();
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO events (eventName, eventDate, eventDesc) VALUES(?, ?, ?)',
            [name, date, desc]);
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