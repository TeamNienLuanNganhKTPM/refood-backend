var mysql = require('mysql');
// var dbConnect = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'Lieutuanvu',
//     database: 'nien_luan'
// });
//Chay db online
var dbConnect;

const handleDisconnect = () => {
    dbConnect = mysql.createConnection({
        host: '103.130.216.100',
        user: 'quananc1_refooddb',
        password: 'Lieutuanvu',
        database: 'quananc1_refood'
    }); // Recreate the connection, since
    // the old one cannot be reused.

    dbConnect.connect(function (err) {              // The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    dbConnect.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}
handleDisconnect();

module.exports = dbConnect;