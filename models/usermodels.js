import { db } from '../db.js'


// This will insert a new user into the db
// This should call functions for encryption
// This should check if the user credentials already exist
// This should perform additional checks on user credentials
// User has: id, email, name, password, isVerified, isAdmin
export const insertUser = async (name, email, password) => {

}

// This will fetch a user's credentials from the db
// Can be used for password comparison for login, or to validate a user exists
// userParams object will have name, email
// this WILL expose the password if hooked up to an endpoint
// ensure passwords are encrypted and this is never passed directly to an endpoint
export const fetchUser = async (userParams) => {
    let connection;
    try {
        connection = await db.pool.getConnection();

        let query = `
            SELECT * FROM users
        `

        let conditions = [];
        let params = [];

        if(userParams?.name){
            conditions.push('userName = ?');
            params.push(userParams.name);
        };
        if(userParams?.email){
            conditions.push('userEmail = ?');
            params.push(userParams.email.toLowerCase());
        };
        if(conditions.length > 0){
            query += `WHERE ${conditions.join(' AND ')}`;
        };

        console.log(query, params);

        const [result] = await connection.query(query, params);

        return result;
    } catch(err) {
        console.error('Error fetching user', err);
        throw(err);
    } finally {
        if(connection) { connection.release(); }
    }
}