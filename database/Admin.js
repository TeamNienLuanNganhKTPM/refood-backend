const dbConnect = require('./dbconnect');
const Food = require('./Food')
class Admin {
    constructor(AdminID, AdminName, AdminPhoneNumber, AdminPassword) {
        this.AdminID = AdminID
        this.AdminName = AdminName
        this.AdminPhoneNumber = AdminPhoneNumber
        this.AdminPassword = AdminPassword
    }
    async login(AdminPhoneNumber, AdminPassword) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
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
        })
    }
    async findWithId(AdminID) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
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
        })
    }
    async updatePassword(AdminID, AdminPassword) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = "UPDATE nhan_vien_phu_trach SET NVPT_MATKHAU = ? WHERE NVPT_MANV = ?";
                dbConnect.query(sql, [AdminPassword, AdminID], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        resolve(result.affectedRows)
                    }
                })
            })
        });
    }
    async updateUserActive(CustomerPhone, CustomerState) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = "UPDATE khach_hang SET KH_TRANGTHAI = ? WHERE KH_SDT = ?";
                dbConnect.query(sql, [CustomerState, CustomerPhone], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        resolve(result.affectedRows)
                    }
                })
            })
        });
    }
    async updateFood(){
        
    }
}
module.exports = Admin