const mysql = require('mysql2');


// Creating a pool connection to the mysql server
const pool = mysql.createPool({
    host: process.env.SERVER,  
    user: process.env.USER,       
    password: process.env.PASSWORD,       
    database: process.env.DATABASE, 
}).promise();  


module.exports = pool;
