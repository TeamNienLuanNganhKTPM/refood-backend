const dbConnect = require('./dbconnect')

class Rating {
    constructor(RatingID, RatingCustomer, RatingFood, RatingMark, RatingTime) {
        this.RatingID = RatingID
        this.RatingCustomer = RatingCustomer
        this.RatingFood = RatingFood
        this.RatingMark = RatingMark
        this.RatingTime = RatingTime
    }

    async checkIfCanRate(RatingCustomer, RatingFood) {
        return new Promise((resolve, reject) => {
            let sql = `
                select ((select count(*) from don_dat_tiec ddt 
                join chi_tiet_don_dat_tiec ctddt on ddt.DDT_MADON = ctddt.DDT_MADON
                join chi_tiet_mon_an ctma on ctddt.CTMA_MACT = ctma.CTMA_MACT
                where ddt.KH_MAKH = ? and ctma.MA_MAMON = ? and DDT_TRANGTHAI = 'Đã hoàn thành')
                +
                (select count(*) from don_dat_mon ddm 
                join chi_tiet_don_dat_mon ctddm on ddm.DDM_MADON = ctddm.DDM_MADON
                join chi_tiet_mon_an ctma on ctddm.CTMA_MACT = ctma.CTMA_MACT
                where ddm.KH_MAKH = ? and ctma.MA_MAMON = ? and DDM_TRANGTHAI = 'Đã hoàn thành')) > 0 DAMUA
            `
            dbConnect.query(sql, [RatingCustomer, RatingFood, RatingCustomer, RatingFood], (err, result) => {
                if (err)
                    reject(err)
                resolve(result[0].DAMUA)
            })
        })
    }

    async isRated(RatingCustomer, RatingFood) {
        return new Promise((resolve, reject) => {
            let sql = `select count(*) DADANHGIA FROM danh_gia where KH_MAKH = ? and MA_MAMON = ?`
            dbConnect.query(sql, [RatingCustomer, RatingFood], (err, result) => {
                if (err)
                    reject(err)
                resolve(result[0].DADANHGIA)
            })
        })
    }

    async create(RatingCustomer, RatingFood, RatingMark) {
        return new Promise((resolve, reject) => {
            let sql = `call THEM_DANH_GIA(?,?,?)`
            dbConnect.query(sql, [RatingFood, RatingCustomer, RatingMark], (err, result) => {
                if (err)
                    reject(err)
                resolve(true)
            })
        })
    }

    async getReviewOfFood(foodid) {
        return new Promise((resolve, reject) => {
            let sql = `
                select dg.DG_MADG, dg.MA_MAMON, dg.KH_MAKH, kh.KH_TENKH, kh.KH_EMAIL, dg.DG_DIEMDG, dg.DG_THOIGIANDG , AVG(dg.DG_DIEMDG) TB 
                FROM danh_gia dg 
                join khach_hang kh on dg.KH_MAKH = kh.KH_MAKH
                where MA_MAMON = ?
                order by dg.COUNT DESC`
            dbConnect.query(sql, [foodid], (err, result) => {
                if (err)
                    reject(err)
                let reviews = []
                if (result.length > 0) {
                    if (result[0].DG_MADG != null)
                        result.forEach((e) => {
                            reviews.push(new Rating(
                                e.DG_MADG,
                                e.KH_TENKH,
                                e.MA_MAMON,
                                e.DG_DIEMDG,
                                e.DG_THOIGIANDG
                            ))
                        })
                    resolve({
                        reviews,
                        TB: result[0].TB
                    })
                } else resolve({})
            })
        })
    }
}

module.exports = Rating