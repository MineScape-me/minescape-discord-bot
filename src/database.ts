import mysql, { QueryOptions, queryCallback } from 'mysql';
import { config } from './config';
const { mysqlHost, mysqlPort, mysqlDatabase, mysqlUsername, mysqlPassword } = config;

// Create a MySQL connection
export const connection = mysql.createConnection({
    host: mysqlHost,
    port: parseInt(mysqlPort),
    user: mysqlUsername,
    database: mysqlDatabase,
    password: mysqlPassword,
    supportBigNumbers: true,
    bigNumberStrings: true
});

export const query = (options: string | QueryOptions, values: any, callback?: queryCallback) =>{
    return connection.query(options, values, (error, results)=>{
        if(error && error.code === 'ECONNRESET'){
            console.log('MySQL connection lost. Reconnecting...');
            connection.connect((connectError) => {
                if(connectError){
                    console.error('Error reconnecting to MySQL:', connectError);
                    if (callback) {
                        callback(error, results);
                    }
                } else {
                    query(options, values, callback);
                }
            });
            return;
        }
        if (callback) {
            callback(error, results);
        }
    });
}

// Test the connection
connection.connect((error) => {
    if (error) {
        console.error('Error connecting to MySQL:', error);
    } else {
        console.log('Connected to MySQL!');
    }
});

// Enable auto-reconnect
connection.on('error', (error) => {
    console.log("CODE: " + error.code);
    if (error.code === 'ECONNRESET') {
        console.log('MySQL connection lost. Reconnecting...');
        connection.connect((connectError) => {
            if(connectError){
                console.error('Error reconnecting to MySQL:', connectError);
            }
        });
    } else {
        throw error;
    }
});
