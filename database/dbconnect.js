var mysql = require('mysql');
var dbconfig = {
    host: '103.130.216.100',
    user: 'quananc1_refooddb',
    password: 'Lieutuanvu',
    database: 'quananc1_refood'
}
var dbConnect = mysql.createPool({
    connectionLimit : 100, //important
    host: '103.130.216.100',
    user: 'quananc1_refooddb',
    password: 'Lieutuanvu',
    database: 'quananc1_refood',
    debug    :  false
});
// var dbConnect
// // = mysql.createConnection({
// //     host: 'localhost',
// //     user: 'root',
// //     password: 'Lieutuanvu',
// //     database: 'nien_luan'
// // });

// // dbConnect.connect((err) => {
// //     if (err) throw err;
// //     console.log("Connected!");
// // });
// const createConnection = () => {
//     return mysql.createConnection({
//         host: '103.130.216.100',
//         user: 'quananc1_refooddb',
//         password: 'Lieutuanvu',
//         database: 'quananc1_refood'
//     })
// }
// dbConnect = createConnection();
// // dbConnect.connect((err) => {
// //     if (err) {
// //         console.log('error when connecting to db:', err);
// //         setTimeout(handleDisconnect, 2000);
// //     }
// //     console.log("Connected!");
// // });
// dbConnect.on('error', (err) => {
//     console.log('Error: ', err.code);
//     if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//         dbConnect = createConnection()
//     } else {
//         throw err;
//     }
// });
module.exports = dbConnect;