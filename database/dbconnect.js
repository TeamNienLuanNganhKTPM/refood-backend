var mysql = require('mysql');
// var dbConnect = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'Lieutuanvu',
//     database: 'nien_luan'
// });
//Chay db online
var dbConnect = mysql.createConnection({
    host: '103.130.216.100',
    user: 'quananc1_refooddb',
    password: 'Lieutuanvu',
    database: 'quananc1_refood'
});
dbConnect.connect((err) => {
    if (err) dbConnect.connect()
    console.log("Connected!");
});
module.exports = dbConnect;