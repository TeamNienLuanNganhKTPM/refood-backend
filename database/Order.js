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
}

module.exports = Order