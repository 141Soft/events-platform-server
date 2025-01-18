import mysql2 from 'mysql2';
import fs from 'fs';
import { parseSQL } from './utils/parsers.js';

const MYSQL_CONF = {
    connectionLimit: 10,
    host: 'localhost',
    user: 'test',
    password: 'secret',
    database: 'test'
}

class DBHelper {

    constructor() {
        this.pool = null;
        return this;
    }

    openPool(config) {
        return this.pool = mysql2.createPool(config);
    }

    closePool() {
        this.pool.end;
        this.pool = null;
    }

    //Allows multiple operations to be carried out on the same connection before releasing
    reserveConnection(callback) {
        this.pool.getConnection((error, connection) => {
            if(error){ 
                console.error(error) 
                return callback(error);
            }
            callback(connection)
            connection.release();
        })
    }

    seed(schemaPath, seedPath) {
        if(this.pool === null){
            console.log('Open a pool before attempting to seed!');
            return false
        };
        if(!schemaPath || !seedPath){
            console.log('Please specify schema and seed.');
            return false
        };

        //Reserving a connection here for potential multiple steps
        this.pool.getConnection((error, connection) => {
            if(error){ console.error(error) };

            const schema = parseSQL(fs.readFileSync(schemaPath));
            const seed = parseSQL(fs.readFileSync(seedPath));
            const queries = [...schema, ...seed];

            queries.forEach((query) => {
                connection.query(query, (error, results) => {
                    if(error){ console.error(error) }
                })
                
            })
            connection.release();
        })
    }
}

export const db = new DBHelper;