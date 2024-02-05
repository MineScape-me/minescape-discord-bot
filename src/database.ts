import mysql from 'mysql';
import { config } from './config';
const { mysqlHost, mysqlPort, mysqlDatabase, mysqlUsername, mysqlPassword } = config;

// Create a MySQL connection
export const connection = mysql.createConnection({
    host: mysqlHost,
    port: parseInt(mysqlPort),
    user: mysqlUsername,
    database: mysqlDatabase,
    password: mysqlPassword,
});

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
        connection.connect();
    } else {
        throw error;
    }
});
