const dbConnect = require('./dbconnect')
// const dbConnect = mysql.createConnection(dbconfig)

class Order {
    constructor(OrderID, OrderCustomer, OrderAdress, OrderAdmin, OrderDate, OrderNote, OrderSubTotal, OrderPaymentMethod, OrderState) {
        this.OrderID = OrderID
        this.OrderCustomer = OrderCustomer
        this.OrderAdress = OrderAdress
        this.OrderAdmin = OrderAdmin
        this.OrderDate = OrderDate
        this.OrderNote = OrderNote
        this.OrderSubTotal = OrderSubTotal
        this.OrderPaymentMethod = OrderPaymentMethod
        this.OrderState = OrderState
    }
    async create(OrderCustomer, OrderAddress, OrderNote, OrderSubTotal, OrderPaymentMethod) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `call THEM_DON_DAT_MON(?,?,?,?,?, @MADON)`;
                dbConnect.query(sql, [OrderCustomer, OrderAddress, OrderNote, OrderSubTotal, OrderPaymentMethod], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve(
                        new Order(
                            result[0][0]['@MADON'],
                            OrderCustomer,
                            OrderAddress,
                            'NV0',
                            new Date(),
                            OrderNote,
                            OrderSubTotal,
                            OrderPaymentMethod,
                            'Chờ xác nhận'
                        )
                    )
                })
            })
        });
    }

    async update(OrderCustomer, OrderID, OrderAddress, OrderNote, OrderPaymentMethod) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `UPDATE don_dat_mon SET DC_MADC= ?,DDM_NOTE = ?,DDM_PTTT= ? 
                            WHERE DDM_MADON = ? AND KH_MAKH = ?`;
                dbConnect.query(sql, [OrderAddress, OrderNote, OrderPaymentMethod, OrderID, OrderCustomer], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve((result.affectedRow))
                })
            })
        });
    }

    async cancel(OrderID) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `UPDATE don_dat_mon SET DDM_TRANGTHAI= 'Đã hủy' 
                            WHERE DDM_MADON = ?`;
                dbConnect.query(sql, [OrderID], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve((result.affectedRow))
                })
            })
        });
    }

    async verifyOrderWithCustomer(OrderCustomer, OrderID) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `SELECT * FROM don_dat_mon WHERE KH_MAKH = ? AND DDM_MADON = ?`;
                dbConnect.query(sql, [OrderCustomer, OrderID], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve((result.length > 0) ? true : false)
                })
            })
        })
    }

    async checkIfOrderCouldBeUpdate(OrderID) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `SELECT * FROM don_dat_mon WHERE DDM_MADON = ? AND DDM_TRANGTHAI <> 'Đã hủy' AND DDM_TRANGTHAI = 'Chờ xác nhận'`;
                dbConnect.query(sql, [OrderID], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve((result.length > 0) ? true : false)
                })
            })
        })
    }

    async getOrderPaymentStatus(OrderID) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `SELECT * FROM don_dat_mon WHERE DDM_MADON = ? AND DDM_TRANGTHAI <> 'Đã hủy'`;
                dbConnect.query(sql, [OrderID], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve((result.length > 0) ? result[0].DDM_PTTT : false)
                })
            })
        })
    }

    async getOrderSubTotal(OrderID) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `SELECT sum(ctddm.CTD_SOLUONG*ctma.CTMA_MUCGIA) SUBTOTAL FROM chi_tiet_don_dat_mon ctddm JOIN chi_tiet_mon_an ctma WHERE ctddm.CTMA_MACT=ctma.CTMA_MACT AND DDM_MADON = ?`;
                dbConnect.query(sql, [OrderID], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve((result.length > 0) ? result[0].SUBTOTAL : false)
                })
            })
        })
    }

    async paid(OrderID, TransID) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `UPDATE don_dat_mon SET DDM_TRANGTHAI = 'Đã thanh toán bằng VNPay', DDM_PTTT = ? 
                            WHERE DDM_MADON = ? AND DDM_TRANGTHAI <> 'Đã thanh toán bằng VNPay'`;
                dbConnect.query(sql, [TransID, OrderID], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve((result.affectedRow) ? true : false)
                })
            })
        });
    }
}

module.exports = Order