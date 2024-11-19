const oracledb = require('oracledb');
require('dotenv').config();

let connection;

async function initOracleDb()
{
    try {
        connection = await oracledb.createPool({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        })
        console.log('OracleDB connected successfully!')
    } catch (error) {
        console.error('Error connecting to OracleDB', error);
        process.exit(1);
    }
}

async function getConnection()
{
    return connection.getConnection();
}

module.exports = { initOracleDb, getConnection };