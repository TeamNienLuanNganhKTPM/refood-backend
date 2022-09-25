var mysql = require('mysql');
var dbConnect = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Lieutuanvu',
    database: 'nien_luan'
});

dbConnect.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});
module.exports = dbConnect;