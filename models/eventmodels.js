import { db } from '../db.js'

//This needs more robust error handling, should validate arguments
//Consider doing a map + promiseAll for img/tagarray queries to make async
const postEvent = async (name, date, desc, imgarray, tagarray) => {

    const query = 
    `
    INSERT INTO events (eventName, eventDate, eventDesc)
    VALUE('${name}','${date}','${desc}')
    RETURNING *;
    `;

    let id;

    try{
        const [fields] = await db.pool.query(query);
        id = fields[0].id;
    } catch(error) {
        console.error(error);
        throw error;
    }

    for(const tag of tagarray){
        const query = 
        `
        INSERT INTO eventTags (eventID, eventTag)
        VALUE('${id}','${tag}');
        `;
        try{
            await db.pool.query(query);
        } catch(error) {
            console.error(error);
            throw error;
        }
    }

    for(const img of imgarray){
        const query = 
        `
        INSERT INTO eventImages (eventID, imgurl)
        VALUE('${id}','${img}');
        `
        try{
            await db.pool.query(query);
        } catch(error) {
            console.error(error);
            throw error;
        }
    }
}