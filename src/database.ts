import mysql, { QueryOptions, queryCallback } from 'mysql';
import { config } from './config';
const { mysqlHost, mysqlPort, mysqlDatabase, mysqlUsername, mysqlPassword } = config;
import redis from './redis';

export const connection = mysql.createPool({
    host: mysqlHost,
    port: parseInt(mysqlPort),
    user: mysqlUsername,
    database: mysqlDatabase,
    password: mysqlPassword,
    supportBigNumbers: true,
    bigNumberStrings: true
});

export const queryCall = (options: string | QueryOptions, values: any, callback?: queryCallback) =>{
    return connection.query(options, values, (error, results)=>{
        if (callback) {
            callback(error, results);
        }
    });
}


export const query = (options: string | QueryOptions, values: any): Promise<any[]> =>{
    return new Promise((resolve, reject) => {
        connection.query(options, values, (error, results)=>{
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

// Test the connection
connection.query('SELECT 1', (error, results) => {
    if (error) {
        console.error('Error connecting to MySQL:', error);
    } else {
        console.log('Connected to MySQL!');
    }
});

connection.on('error', (error) => {
    console.log("CODE: " + error.code);
    if (error.code === 'ECONNRESET') {
        console.log('MySQL connection lost. Reconnecting...');
    } else {
        throw error;
    }
});
