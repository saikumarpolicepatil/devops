const mysql = require("mysql");
const db = mysql.createConnection({
    host:'localhost',
    user : 'root',
    password:'',
    // update the database name here
    database:'clubs'
})
module.exports = db;