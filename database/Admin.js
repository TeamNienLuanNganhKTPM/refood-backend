const dbConnect = require('./dbconnect');
const { soNgayTrongThang } = require('../function/Inspect')
class Admin {
    constructor(AdminID, AdminName, AdminPhoneNumber, AdminPassword) {
        this.AdminID = AdminID
        this.AdminName = AdminName
        this.AdminPhoneNumber = AdminPhoneNumber
        this.AdminPassword = AdminPassword
    }
    async login(AdminPhoneNumber, AdminPassword) {
        return new Promise((resolve, reject) => {
            const sql = `
                        SELECT * FROM nhan_vien_phu_trach 
                        WHERE NVPT_SDT = ? AND NVPT_MATKHAU = ?`;
            dbConnect.query(sql, [AdminPhoneNumber, AdminPassword], (err, result) => {
                if (err)
                    return reject(err)
                else
                    if (result.length > 0)
                        resolve(
                            new Admin(
                                result[0]['NVPT_MANV'],
                                result[0]['NVPT_TENNV'],
                                result[0]['NVPT_SDT'],
                                null
                            )
                        )
                    else
                        resolve(undefined);
            })
        })
    }
    async findWithId(AdminID) {
        return new Promise((resolve, reject) => {
            const sql = `
                        SELECT * FROM nhan_vien_phu_trach 
                        WHERE NVPT_MANV = ?`;
            dbConnect.query(sql, [AdminID], (err, result) => {
                if (err)
                    return reject(err)
                else
                    if (result.length > 0)
                        resolve(
                            new Admin(
                                result[0]['NVPT_MANV'],
                                result[0]['NVPT_TENNV'],
                                result[0]['NVPT_SDT'],
                                result[0]['NVPT_MATKHAU'],
                            )
                        )
                    else
                        resolve(
                            new Admin(
                                null, null, null, null
                            )
                        );
            })
        })
    }
    async updatePassword(AdminID, AdminPassword) {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE nhan_vien_phu_trach SET NVPT_MATKHAU = ? WHERE NVPT_MANV = ?";
            dbConnect.query(sql, [AdminPassword, AdminID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                else {
                    resolve(result.affectedRows)
                }
            })
        });
    }
    async updateUserActive(CustomerPhone, CustomerState) {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE khach_hang SET KH_TRANGTHAI = ? WHERE KH_SDT = ?";
            dbConnect.query(sql, [CustomerState, CustomerPhone], (err, result) => {
                if (err) {
                    return reject(err)
                }
                else {
                    resolve(result.affectedRows)
                }
            })
        });
    }

    async analysisOrder() {
        return new Promise((resolve, reject) => {
            let sql = `select 
            (select count(*) from don_dat_tiec) + (select count(*) from don_dat_mon) TONG_DON_HANG`
            dbConnect.query(sql, [], (err, result) => {
                if (err)
                    return reject(err)
                resolve(result[0].TONG_DON_HANG)
            })
        })
    }

    async analysisFood() {
        return new Promise((resolve, reject) => {
            let sql = `select count(*) TONG_MON_AN from mon_an`
            dbConnect.query(sql, [], (err, result) => {
                if (err)
                    return reject(err)
                resolve(result[0].TONG_MON_AN)
            })
        })
    }

    async analysisCustomer() {
        return new Promise((resolve, reject) => {
            let sql = `select count(*) TONG_KHACH_HANG from khach_hang`
            dbConnect.query(sql, [], (err, result) => {
                if (err)
                    return reject(err)
                resolve(result[0].TONG_KHACH_HANG)
            })
        })
    }

    async analysisRevenue() {
        return new Promise((resolve, reject) => {
            let sql = `select 
            (select sum(DDM_TONGTIEN) TONG_TIEN from don_dat_mon WHERE DDM_PTTT <> 'cod' or (DDM_PTTT='cod' and DDM_TRANGTHAI = 'Đã hoàn thành')) 
            + 
            (select sum(DDT_TONGTIEN) TONG_TIEN from don_dat_tiec where DDT_TRANGTHAI = 'Đã hoàn thành') TONG_TIEN`
            dbConnect.query(sql, [], (err, result) => {
                if (err)
                    return reject(err)
                resolve(result[0].TONG_TIEN)
            })
        })
    }

    async analysisRevenueByTime(month, year) {
        return new Promise((resolve, reject) => {
            let sql = `select 
            (select sum(DDM_TONGTIEN) TONG_TIEN from don_dat_mon WHERE ((DDM_PTTT <> 'cod' and DDM_TRANGTHAI <>'Đã hủy') or (DDM_PTTT='cod' and DDM_TRANGTHAI = 'Đã hoàn thành')) and MONTH(ddm_ngaygio) = ? and YEAR(ddm_ngaygio) = ?) 
            + 
            (select sum(DDT_TONGTIEN) TONG_TIEN from don_dat_tiec where DDT_TRANGTHAI = 'Đã hoàn thành' and MONTH(ddt_ngaygiodai) = ? and YEAR(ddt_ngaygiodai) = ?) TONG_TIEN`
            dbConnect.query(sql, [month, year, month, year], (err, result) => {
                if (err)
                    return reject(err)
                resolve(result[0].TONG_TIEN)
            })
        })
    }
    async analysisRevenueByTimeEachDay(month, year) {
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT DAY(NGAY) NGAY, SUM(TONG_TIEN) TIEN_NGAY FROM 
            (select sum(DDM_TONGTIEN) TONG_TIEN, date(DDM_NGAYGIO) NGAY  from don_dat_mon WHERE ((DDM_PTTT <> 'cod' and DDM_TRANGTHAI <>'Đã hủy') or (DDM_PTTT='cod' and DDM_TRANGTHAI = 'Đã hoàn thành')) and MONTH(ddm_ngaygio) = ? and YEAR(ddm_ngaygio) = ? group by date(DDM_NGAYGIO)
            UNION ALL
            select sum(DDT_TONGTIEN) TONG_TIEN, date(ddt_ngaygiodai) NGAY from don_dat_tiec where DDT_TRANGTHAI = 'Đã hoàn thành' and MONTH(ddt_ngaygiodai) = ? and YEAR(ddt_ngaygiodai) = ? group by date(ddt_ngaygiodai)) tientheongay
            GROUP BY (tientheongay.NGAY)
            ORDER BY NGAY`
            dbConnect.query(sql, [month, year, month, year], (err, result) => {
                if (err)
                    return reject(err)
                let revenue = []
                for (let i = 1; i <= soNgayTrongThang(parseInt(month), parseInt(year)); i++) {
                    revenue.push({
                        NGAY: i,
                        TIEN_NGAY: (revenue.NGAY == i) ? revenue.TIEN_NGAY : 0
                    })
                }
                result.forEach(e => {
                    revenue[e.NGAY - 1].TIEN_NGAY = e.TIEN_NGAY
                })
                resolve(revenue)
            })
        })
    }
}
module.exports = Admin