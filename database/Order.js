const dbConnect = require('./dbconnect')
const { getOrderPaymentMethod, orderStatus } = require('../function/orderStatus')
class Order {
    constructor(OrderID, OrderCustomer, OrderAdress, OrderAdmin, OrderDate, OrderDetails, OrderNote, OrderSubTotal, OrderPaymentMethod, OrderState) {
        this.OrderID = OrderID
        this.OrderCustomer = OrderCustomer
        this.OrderAdress = OrderAdress
        this.OrderAdmin = OrderAdmin
        this.OrderDate = OrderDate
        this.OrderNote = OrderNote
        this.OrderSubTotal = OrderSubTotal
        this.OrderPaymentMethod = OrderPaymentMethod
        this.OrderState = OrderState
        this.OrderDetails = OrderDetails
    }
    async create(OrderCustomer, OrderAddress, OrderNote, OrderSubTotal, OrderPaymentMethod) {
        return new Promise((resolve, reject) => {
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
                        'Show in order detail page',
                        OrderNote,
                        OrderSubTotal,
                        OrderPaymentMethod,
                        'Chờ xác nhận'
                    )
                )
            })
        });
    }

    async getAll(OrderCustomer) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM don_dat_mon WHERE KH_MAKH = ?
                        ORDER BY DDM_NGAYGIO DESC`
            dbConnect.query(sql, [OrderCustomer], (err, result) => {
                if (err)
                    return reject(err)
                let order = []
                result.forEach(e => {
                    order.push({
                        OrderID: e.DDM_MADON,
                        OrderDate: e.DDM_NGAYGIO,
                        OrderNote: e.DDM_NOTE,
                        OrderSubTotal: e.DDM_TONGTIEN,
                        OrderState: orderStatus.indexOf(e.DDM_TRANGTHAI),
                        OrderPaymentMethod: e.DDM_PTTT == 'cod' ? 'COD' : 'VNPay'
                    })
                })
                resolve(order)
            })
        })
    }

    async getAllForAdmin() {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM don_dat_mon
                        ORDER BY DDM_NGAYGIO DESC`
            dbConnect.query(sql, [], (err, result) => {
                if (err)
                    return reject(err)
                let order = []
                result.forEach(e => {
                    order.push({
                        OrderID: e.DDM_MADON,
                        OrderDate: e.DDM_NGAYGIO,
                        OrderNote: e.DDM_NOTE,
                        OrderSubTotal: e.DDM_TONGTIEN,
                        OrderState: orderStatus.indexOf(e.DDM_TRANGTHAI),
                        OrderPaymentMethod: getOrderPaymentMethod(e.DDM_PTTT)
                    })
                })
                resolve(order)
            })
        })
    }

    async get(OrderID) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT ddm.DDM_MADON, ddm.DDM_NGAYGIO, ddm.DDM_TONGTIEN, ddm.DDM_NOTE, ddm.DDM_PTTT, ddm.DDM_TRANGTHAI ,
                    kh.KH_MAKH,kh.KH_TENKH, kh.KH_SDT,
                    dc.DC_MADC, dc.DC_NGUOINHAN, dc.DC_SDTNHAN, dc.DC_DIACHI, dc.DC_TENPHUONG,dc.DC_TENQUANHUYEN,
                    nvpt.NVPT_MANV, nvpt.NVPT_TENNV,
                    ma.MA_MAMON, ma.MA_TENMON, toSlug(ma.MA_TENMON) MA_SLUG, lma.LMA_TENLOAI,
                    ama.AMA_URL,
                    ctma.CTMA_MUCGIA, ctma.CTMA_KHAUPHAN,
                    ctddm.CTD_SOLUONG
                FROM don_dat_mon ddm
                JOIN khach_hang kh on ddm.KH_MAKH = kh.KH_MAKH
                JOIN dia_chi dc on ddm.DC_MADC = dc.DC_MADC
                JOIN nhan_vien_phu_trach nvpt on ddm.NVPT_MANV = nvpt.NVPT_MANV
                JOIN chi_tiet_don_dat_mon ctddm on ddm.DDM_MADON = ctddm.DDM_MADON
                JOIN chi_tiet_mon_an ctma on ctddm.CTMA_MACT = ctma.CTMA_MACT
                JOIN mon_an ma on ctma.MA_MAMON = ma.MA_MAMON
                JOIN loai_mon_an lma on ma.LMA_MALOAI = lma.LMA_MALOAI
                JOIN anh_mon_an ama on ma.MA_MAMON = ama.MA_MAMON 
                WHERE ddm.DDM_MADON = ? 
                GROUP BY ctma.CTMA_MACT`;
            dbConnect.query(sql, [OrderID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                if (result.length > 0) {
                    let OrderDetails = []
                    result.forEach(e => {
                        OrderDetails.push({
                            FoodId: e.MA_MAMON,
                            FoodName: e.MA_TENMON,
                            FoodSlug: e.MA_SLUG,
                            FoodType: e.LMA_TENLOAI,
                            FoodThumb: `https://drive.google.com/uc?id=${e.AMA_URL}`,
                            FoodPrice: e.CTMA_MUCGIA,
                            FoodRation: e.CTMA_KHAUPHAN,
                            FoodQuantity: e.CTD_SOLUONG,
                            Total: parseInt(e.CTMA_MUCGIA) * parseInt(e.CTD_SOLUONG)
                        })
                    })
                    resolve(new Order(
                        result[0]['DDM_MADON'],
                        `${result[0]['KH_TENKH']} - ${result[0]['KH_SDT']}`,
                        `${result[0]['DC_NGUOINHAN']} - ${result[0]['DC_SDTNHAN']} - ${result[0]['DC_DIACHI']} - ${result[0]['DC_TENPHUONG']} - ${result[0]['DC_TENQUANHUYEN']}`,
                        result[0]['NVPT_TENNV'],
                        result[0]['DDM_NGAYGIO'],
                        OrderDetails,
                        result[0]['DDM_NOTE'],
                        result[0]['DDM_TONGTIEN'],
                        getOrderPaymentMethod(result[0]['DDM_PTTT']),
                        orderStatus.indexOf(result[0]['DDM_TRANGTHAI'])
                    ))
                } else
                    resolve(false)

            })
        })
    }

    async filter(OrderID, CustomerPhone, DateStart, DateEnd) {
        return new Promise((resolve, reject) => {
            let whereQuery = ''
            let sqlArray = []
            if (OrderID != undefined && OrderID != '') {
                if (sqlArray.length > 0)
                    whereQuery = whereQuery.concat(` AND `)
                whereQuery = whereQuery.concat(` DDM_MADON = ? `)
                sqlArray.push(OrderID)
            }
            if (CustomerPhone != undefined && CustomerPhone != '') {
                if (sqlArray.length > 0)
                    whereQuery = whereQuery.concat(` AND `)
                whereQuery = whereQuery.concat(` kh.KH_SDT = ? `)
                sqlArray.push(CustomerPhone)
            }
            if (DateStart != undefined && DateStart != '') {
                if (sqlArray.length > 0)
                    whereQuery = whereQuery.concat(` AND `)
                whereQuery = whereQuery.concat(` DATE(DDM_NGAYGIO) >= ? `)
                sqlArray.push(DateStart)
            }
            if (DateEnd != undefined && DateEnd != '') {
                if (sqlArray.length > 0)
                    whereQuery = whereQuery.concat(` AND `)
                whereQuery = whereQuery.concat(` DATE(DDM_NGAYGIO) <= ? `)
                sqlArray.push(DateEnd)
            }
            if (whereQuery != '') whereQuery = 'WHERE ' + whereQuery
            let sql = `SELECT * FROM don_dat_mon ddm join khach_hang kh ON kh.KH_MAKH = ddm.KH_MAKH
                        ${whereQuery} ORDER BY DDM_NGAYGIO DESC`;
            dbConnect.query(sql, sqlArray, (err, result) => {
                if (err)
                    return reject(err)
                let order = []
                result.forEach(e => {
                    order.push({
                        OrderID: e.DDM_MADON,
                        OrderDate: e.DDM_NGAYGIO,
                        OrderNote: e.DDM_NOTE,
                        OrderSubTotal: e.DDM_TONGTIEN,
                        OrderState: orderStatus.indexOf(e.DDM_TRANGTHAI),
                        OrderPaymentMethod: getOrderPaymentMethod(e.DDM_PTTT)
                    })
                })
                resolve(order)
            })
        })
    }

    async updateForAdmin(OrderID, OrderState) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE don_dat_mon SET DDM_TRANGTHAI = ?
                        WHERE DDM_MADON = ?`;
            dbConnect.query(sql, [OrderState, OrderID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve((result.affectedRow))
            })
        });
    }

    async update(OrderCustomer, OrderID, OrderAddress, OrderNote, OrderPaymentMethod) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE don_dat_mon SET DC_MADC = ?, DDM_NOTE = ?, DDM_PTTT = ?
                        WHERE DDM_MADON = ? AND KH_MAKH = ? `;
            dbConnect.query(sql, [OrderAddress, OrderNote, OrderPaymentMethod, OrderID, OrderCustomer], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve((result.affectedRow))
            })
        });
    }

    async cancel(OrderID) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE don_dat_mon SET DDM_TRANGTHAI = 'Đã hủy' 
                            WHERE DDM_MADON = ? `;
            dbConnect.query(sql, [OrderID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve((result.affectedRow))
            })
        });
    }

    async verifyOrderWithCustomer(OrderCustomer, OrderID) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM don_dat_mon WHERE KH_MAKH = ? AND DDM_MADON = ? `;
            dbConnect.query(sql, [OrderCustomer, OrderID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve((result.length > 0) ? true : false)
            })
        })
    }

    async checkIfOrderCouldBeUpdate(OrderID) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM don_dat_mon WHERE DDM_MADON = ? AND DDM_TRANGTHAI <> 'Đã hủy' AND DDM_TRANGTHAI = 'Chờ xác nhận'`;
            dbConnect.query(sql, [OrderID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve((result.length > 0) ? true : false)
            })
        })
    }

    async getOrderPaymentStatus(OrderID) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM don_dat_mon WHERE DDM_MADON = ? AND DDM_TRANGTHAI <> 'Đã hủy'`;
            dbConnect.query(sql, [OrderID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve((result.length > 0) ? result[0].DDM_PTTT : false)
            })
        })
    }

    async getOrderStatus(OrderID) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM don_dat_mon WHERE DDM_MADON = ? AND DDM_TRANGTHAI <> 'Đã hủy'`;
            dbConnect.query(sql, [OrderID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve((result.length > 0) ? result[0].DDM_TRANGTHAI : false)
            })
        })
    }

    async getPaymentMethod(OrderID) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM don_dat_mon WHERE DDM_MADON = ?`;
            dbConnect.query(sql, [OrderID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve((result.length > 0) ? result[0].DDM_PTTT : false)
            })
        })
    }

    async getOrderSubTotal(OrderID) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT sum(ctddm.CTD_SOLUONG * ctma.CTMA_MUCGIA) SUBTOTAL FROM chi_tiet_don_dat_mon ctddm JOIN chi_tiet_mon_an ctma WHERE ctddm.CTMA_MACT = ctma.CTMA_MACT AND DDM_MADON = ? `;
            dbConnect.query(sql, [OrderID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve((result.length > 0) ? result[0].SUBTOTAL : false)
            })
        })
    }

    async paid(OrderID, TransID) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE don_dat_mon SET DDM_PTTT = ?
                        WHERE DDM_MADON = ? AND DDM_TRANGTHAI <> 'Đã thanh toán bằng VNPay'`;
            dbConnect.query(sql, [TransID, OrderID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve((result.changedRows == 1) ? true : false)
            })
        });
    }
}

module.exports = Order