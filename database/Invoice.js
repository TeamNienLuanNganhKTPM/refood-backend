const dbConnect = require('./dbconnect')
const {getOrderPaymentMethod} = require('../function/orderStatus')
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
                if (err)
                    return reject(err)
                resolve(result[0][0]['MAHD'])
            })
        })
    }

    async getAllAdmin() {
        return new Promise((resolve, reject) => {
            let sql = `select HD_MAHD, DDM_MADON, DDT_MADON, HD_THOI_DIEM_THANH_TOAN from hoa_don where HD_MAHD in 
                        (select DISTINCT(hd.HD_MAHD) from hoa_don hd
                        join don_dat_tiec ddt on ddt.DDT_MADON = hd.DDT_MADON
                        union all
                        select DISTINCT(hd.HD_MAHD) from hoa_don hd
                        join don_dat_mon ddm on ddm.DDM_MADON = hd.DDM_MADON) 
                        order by HD_THOI_DIEM_THANH_TOAN DESC`
            dbConnect.query(sql, [], (err, result) => {
                if (err)
                    return reject(err)
                let invoice = []
                if (result.length > 0)
                    result.forEach(e => {
                        invoice.push(new Invoice(
                            e.HD_MAHD,
                            (e.DDM_MADON == null) ? e.DDT_MADON : e.DDM_MADON,
                            e.HD_THOI_DIEM_THANH_TOAN)
                        )
                    });
                resolve(invoice)
            })
        })
    }

    async getAll(CustomerId) {
        return new Promise((resolve, reject) => {
            let sql = `select HD_MAHD, DDM_MADON, DDT_MADON, HD_THOI_DIEM_THANH_TOAN from hoa_don where HD_MAHD in 
                        (select DISTINCT(hd.HD_MAHD) from hoa_don hd
                        join don_dat_tiec ddt on ddt.DDT_MADON = hd.DDT_MADON
                        where ddt.KH_MAKH = ?
                        union all
                        select DISTINCT(hd.HD_MAHD) from hoa_don hd
                        join don_dat_mon ddm on ddm.DDM_MADON = hd.DDM_MADON
                        where ddm.KH_MAKH = ?) 
                        order by HD_THOI_DIEM_THANH_TOAN DESC`
            dbConnect.query(sql, [CustomerId, CustomerId], (err, result) => {
                if (err)
                    return reject(err)
                let invoice = []
                if (result.length > 0)
                    result.forEach(e => {
                        invoice.push(new Invoice(
                            e.HD_MAHD,
                            (e.DDM_MADON == null) ? e.DDT_MADON : e.DDM_MADON,
                            e.HD_THOI_DIEM_THANH_TOAN)
                        )
                    });
                resolve(invoice)
            })
        })
    }

    async getDetail(CustomerId, InvoiceID) {
        return new Promise((resolve, reject) => {
            let sql = "call getInvoiceDetail(?,?)"
            dbConnect.query(sql, [CustomerId, InvoiceID], (err, result) => {
                if (err)
                    return reject(err)
                if (result[0].length > 0) {
                    let InvoiceDetail = []
                    result[0].forEach(e => {
                        InvoiceDetail.push({
                            FoodId: e.MA_MAMON,
                            FoodName: e.MA_TENMON,
                            FoodSlug: e.MA_SLUG,
                            FoodType: e.LMA_TENLOAI,
                            FoodThumb: `https://drive.google.com/uc?id=${e.AMA_URL}`,
                            FoodPrice: e.CTMA_MUCGIA,
                            FoodRation: e.CTMA_KHAUPHAN,
                            FoodQuantity: e.SOLUONG,
                            Total: parseInt(e.CTMA_MUCGIA) * parseInt(e.SOLUONG)
                        })
                    })
                    resolve({
                        InvoiceID: result[0][0]['HD_MAHD'],
                        InvoiceOrderID: result[0][0]['MaDON'],
                        InvoicePaidTime: result[0][0]['HD_THOI_DIEM_THANH_TOAN'],
                        InvoiceOrderDate: result[0][0]['NGAYDAT'],
                        InvoiceSubTotal: result[0][0]['TONGTIEN'],
                        InvoicePaymentMethod: getOrderPaymentMethod(result[0][0]['PTTT']),
                        InvoiceCustomer: `${result[0][0]['KH_TENKH']} - ${result[0][0]['KH_SDT']}`,
                        InvoicePlace: result[0][0]['DIADIEM'],
                        InvoiceAdmin: result[0][0]['NVPT_TENNV'],
                        InvoiceDetail
                    })
                }
                resolve(false)
            })
        })
    }
}

module.exports = Invoice