const dbConnect = require('./dbconnect')

class Invoice {
    constructor(InvoiceID, InvoiceOrderID, InvoicePaidTime) {
        this.InvoiceID = InvoiceID
        this.InvoiceOrderID = InvoiceOrderID
        this.InvoicePaidTime = InvoicePaidTime
    }

    async create(InvoiceOrderID) {
        return new Promise((resolve, reject) => {
            let sql = "call LAP_HOA_DON_DAT_MON(?)"
            dbConnect.query(sql, [InvoiceOrderID], (err, result) => {
                if(err)
                    return reject(err)
                resolve(result[0][0]['MAHD'])
            })
        })
    }
}

module.exports = Invoice