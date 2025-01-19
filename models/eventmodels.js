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

//Should take a large number of search params
//Will only retrieve lightweight data: Name, id, date, tags, thumbnail, stub
//Detailed data will come from a getEvent() singular which takes id

//This time complexity needs work
export const fetchEvents = async() => {

    let connection;

    try {
        connection = await db.pool.getConnection();

        const [result] = await connection.query(`
            SELECT e.*, et.eventTag AS tag
            FROM events e
            LEFT JOIN eventTags et ON e.id = et.eventID
            `);

        const groupedEvents = [];

        for(const event of result){
            if(groupedEvents.filter(e => e.id === event.id).length === 0){
                
                event.tags = [event.tag];
                delete event.tag;
                console.log(event);
                groupedEvents.push(event);
            }
            else{
                const idCheck = (e) => e.id === event.id;
                const i = groupedEvents.findIndex(idCheck);
                groupedEvents[i].tags = [...groupedEvents[i].tags, event.tag];
            }
        }

        return groupedEvents;

    } catch(error) {
        console.error(error);
        throw error;
    } finally {
        if(connection) { connection.release(); }
    }
}