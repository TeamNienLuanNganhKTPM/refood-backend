const dbConnect = require('./dbconnect');

class FoodType {
    constructor(FoodTypeId, FoodTypeName, FoodTypeSlug, FoodTypeDescription) {
        this.FoodTypeId = FoodTypeId;
        this.FoodTypeName = FoodTypeName;
        this.FoodTypeSlug = FoodTypeSlug;
        this.FoodTypeDescription = FoodTypeDescription;
    };
    async create(FoodTypeName, FoodTypeDescription) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = "call THEM_LOAI_MON_AN (?, ?, @FoodTypeID)";
                // const sql = "INSERT INTO khach_hang(KH_MAKH, KH_TENKH, KH_SDT, KH_EMAIL, KH_MATKHAU, KH_TRANGTHAI) VALUES (?,?,?,?,?,?)";
                dbConnect.query(sql, [FoodTypeName, FoodTypeDescription], (err, result) => {
                    if (err)
                        return reject(err)
                    resolve(new FoodType(result[0][0]['@FoodTypeID'], FoodTypeName, FoodTypeDescription));
                })
            })
        });
    }
    async update(FoodTypeId, FoodTypeName, FoodTypeDescription) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = "call CAP_NHAT_LOAI_MON_AN (?, ?, ?)";
                // const sql = "INSERT INTO khach_hang(KH_MAKH, KH_TENKH, KH_SDT, KH_EMAIL, KH_MATKHAU, KH_TRANGTHAI) VALUES (?,?,?,?,?,?)";
                dbConnect.query(sql, [FoodTypeId, FoodTypeName, FoodTypeDescription], (err, result) => {
                    if (err)
                        return reject(err)
                    resolve(true);
                })
            })
        });
    }
    async find(FoodTypeName) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = "SELECT LMA_MALOAI, LMA_TENLOAI, toSlug(LMA_TENLOAI) SLUG, LMA_MOTA FROM loai_mon_an WHERE LMA_MALOAI = ?";
                dbConnect.query(sql, [FoodTypeName], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0)
                            resolve(new FoodType(result[0].LMA_MALOAI, result[0].LMA_TENLOAI, result[0].LMA_TENLOAI, result[0].LMA_MOTA));
                        else
                            resolve(new FoodType())
                    }

                })
            })
        });
    }
    async findByID(FoodTypeId) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = "SELECT LMA_MALOAI, LMA_TENLOAI, toSlug(LMA_TENLOAI) SLUG, LMA_MOTA FROM loai_mon_an WHERE LMA_MALOAI = ?";
                dbConnect.query(sql, [FoodTypeId], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0)
                            resolve(new FoodType(result[0].LMA_MALOAI, result[0].LMA_TENLOAI, result[0].SLUG, result[0].LMA_MOTA));
                        else
                            resolve(new FoodType())
                    }

                })
            })
        });
    }

    async findByName(FoodTypeName) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = "SELECT LMA_MALOAI, LMA_TENLOAI, toSlug(LMA_TENLOAI) SLUG, LMA_MOTA FROM loai_mon_an WHERE LMA_TENLOAI = ?";
                dbConnect.query(sql, [FoodTypeName], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0)
                            resolve(new FoodType(result[0].LMA_MALOAI, result[0].LMA_TENLOAI, result[0].SLUG, result[0].LMA_MOTA));
                        else
                            resolve(new FoodType())
                    }

                })
            })
        });
    }
    async getAll() {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = "SELECT *, toSlug(LMA_TENLOAI) SLUG FROM loai_mon_an";
                dbConnect.query(sql, [], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0) {
                            let foodtypes = [];
                            result.forEach(item => {
                                foodtypes.push(new FoodType(item.LMA_MALOAI, item.LMA_TENLOAI, item.SLUG, item.LMA_MOTA))
                            });
                            resolve(foodtypes);
                        }
                        else
                            resolve(new FoodType())
                    }

                })
            })
        });
    }
    async deleteFoodType(FoodTypeId) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                let sql = `DELETE FROM loai_mon_an WHERE LMA_MALOAI = ?`;
                dbConnect.query(sql, [FoodTypeId], (err, result) => {
                    if (err)
                        return reject(err)
                    resolve(true)
                })
            })
        })
    }
    async checkIfExistFoodWithFoodtype(FoodTypeId) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                let sql = `SELECT * FROM mon_an WHERE LMA_MALOAI = ?`;
                dbConnect.query(sql, [FoodTypeId], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0) {
                            resolve(true);
                        }
                        else
                            resolve(false)
                    }

                })
            })
        })
    }
    async checkIfFoodtypeIsExits(FoodTypeId) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                let sql = `SELECT * FROM loai_mon_an WHERE LMA_MALOAI = ?`;
                dbConnect.query(sql, [FoodTypeId], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0) {
                            resolve(true)
                        }
                        else
                            resolve(false)
                    }

                })
            })
        })

    }
}
module.exports = FoodType;