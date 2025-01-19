import { db } from '../db.js'

//This needs more robust error handling, should validate arguments
//Consider doing a map + promiseAll for img/tagarray queries to make async
const postEvent = async (name, date, desc, imgarray, tagarray) => {

    const query = 
    `
    INSERT INTO events (eventName, eventDate, eventDesc)
    VALUES(?, ?, ?)
    RETURNING *;
    `;

    let id;

    try{
        const [fields] = await db.pool.query(query,[name, date, desc]);
        id = fields[0].id;
    } catch(error) {
        console.error(error);
        throw error;
    }

    for(const tag of tagarray){
        const query = 
        `
        INSERT INTO eventTags (eventID, eventTag)
        VALUES(?, ?);
        `;
        try{
            await db.pool.query(query,[id, tag]);
        } catch(error) {
            console.error(error);
            throw error;
        }
    }

    for(const img of imgarray){
        const query = 
        `
        INSERT INTO eventImages (eventID, imgurl)
        VALUES(?, ?);
        `
        try{
            await db.pool.query(query, [id, img]);
        } catch(error) {
            console.error(error);
            throw error;
        }
    }
}