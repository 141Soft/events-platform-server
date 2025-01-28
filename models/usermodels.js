import { db } from '../db.js'
import { hashPassword } from '../utils/hashing.js';


// This will insert a new user into the db
// This should call functions for encryption
// This should check if the user credentials already exist
// This should perform additional checks on user credentials
// User has: id, email, name, password, isVerified, isAdmin
export const insertUser = async (userParams) => {
    let connection;
    try {
        connection = await db.pool.getConnection();

        const query = `
            INSERT INTO users 
            (userEmail, userName, userPassword, isVerified, isAdmin) 
            VALUES(?, ?, ?, ?, ?);
            `
            
        userParams.password = await hashPassword(userParams.password, 10);

        const params = [userParams.email, userParams.name, userParams.password, 0, 0];

        const [result] = await connection.query(query, params);
        if(result.affectedRows === 1){
            const [result] = await connection.query('SELECT * FROM users WHERE id = LAST_INSERT_ID();')
            return { 
                status: 'success', 
                message: 'User created',
                user: {
                    userName: result[0].userName,
                    userEmail: result[0].userEmail,
                }
            };
        } else {
            return { status: 'error' };
        }
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if(connection){ connection.release(); }
    }
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

        const [result] = await connection.query(query, params);
        return result;
    } catch(err) {
        console.error('Error fetching user', err);
        throw(err);
    } finally {
        if(connection) { connection.release(); }
    }
}