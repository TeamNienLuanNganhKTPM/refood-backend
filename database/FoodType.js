const dbConnect = require('./dbconnect');

class FoodType {
    constructor(FoodTypeId, FoodTypeName, FoodTypeDescription) {
        this.FoodTypeId = FoodTypeId;
        this.FoodTypeName = FoodTypeName;
        this.FoodTypeDescription = FoodTypeDescription;
    };
    async create(FoodTypeName, FoodTypeDescription) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = "call THEM_LOAI_MON_AN (?, ?)";
                // const sql = "INSERT INTO khach_hang(KH_MAKH, KH_TENKH, KH_SDT, KH_EMAIL, KH_MATKHAU, KH_TRANGTHAI) VALUES (?,?,?,?,?,?)";
                dbConnect.query(sql, [FoodTypeName, FoodTypeDescription], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.affectedRows == 1)
                            resolve(new FoodType(FoodTypeName, FoodTypeDescription));
                        else
                            resolve(new FoodType())
                    }

                })
            })
        });
    }
    async find(FoodTypeName) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = "SELECT LMA_MALOAI, LMA_TENLOAI, LMA_MOTA FROM loai_mon_an WHERE LMA_TENLOAI = ?";
                dbConnect.query(sql, [FoodTypeName], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0)
                            resolve(new FoodType(result[0].LMA_MALOAI, result[0].LMA_TENLOAI, result[0].LMA_MOTA));
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
                const sql = "SELECT * FROM loai_mon_an";
                dbConnect.query(sql, [], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0) {
                            let foodtypes = [];
                            result.forEach(item => {
                                foodtypes.push(new FoodType(item.LMA_MALOAI, item.LMA_TENLOAI, item.LMA_MOTA))
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
}
module.exports = FoodType;