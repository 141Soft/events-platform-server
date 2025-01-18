import mysql from 'mysql';
import fs from 'fs';
import { parseSQL } from './parsers.js';

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

    openPool() {
        return this.pool = mysql.createPool(MYSQL_CONF);
    }

    closePool() {
        this.pool.end;
        this.pool = null;
    }

    seed(schemaPath, seedPath) {
        if(this.pool === null){
            console.log('Open a pool before attempting to seed!');
            return false
        };
        if(!schemaPath || !seedPath){
            console.log('Please specify schema and seed.');
            return false
        }

        this.pool.getConnection((error, connection) => {
            if(error){ console.error(error) };

            //Schema
            const schema = parseSQL(fs.readFileSync(schemaPath));
            schema.forEach((query) => {
                connection.query(query, (error) => {
                    if(error){ console.error(error) };
                });
            })

            //Seed
            const seed = parseSQL(fs.readFileSync(seedPath));
            seed.forEach((query) => {
                connection.query(query, (error) => {
                    if(error){ console.error(error) };
                });
            })

            connection.release();
        })
    }
}

export const db = new DBHelper;