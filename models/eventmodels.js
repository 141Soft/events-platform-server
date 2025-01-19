import { db } from '../db.js'

//This is going to need to take arrays of img urls and a tag array to be iterated over.
const postEvent = async (name, date, desc) => {

    const query = 
    `
    INSERT INTO events (eventName, eventDate, eventDesc)
    VALUE('${name}','${date}','${desc}')
    `;

    try{
        await db.pool.query(query);
        return true;
    } catch(error) {
        console.error(error);
        throw error;
    }
}