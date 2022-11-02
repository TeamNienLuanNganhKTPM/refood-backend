const dbConnect = require('./dbconnect')

class Rating {
    constructor(RatingID, RatingCustomer, RatingFood, RatingMark) {
        this.RatingID = RatingID
        this.RatingCustomer = RatingCustomer
        this.RatingFood = RatingFood
        this.RatingMark = RatingMark
    }

    async checkIfCanRate(RatingCustomer, RatingFood) {
        return new Promise((resolve, reject) => {
            let sql = `
                select ((select count(*) from don_dat_tiec ddt 
                join chi_tiet_don_dat_tiec ctddt on ddt.DDT_MADON = ctddt.DDT_MADON
                join chi_tiet_mon_an ctma on ctddt.CTMA_MACT = ctma.CTMA_MACT
                where ddt.KH_MAKH = ? and ctma.MA_MAMON = ?)
                +
                (select count(*) from don_dat_mon ddm 
                join chi_tiet_don_dat_mon ctddm on ddm.DDM_MADON = ctddm.DDM_MADON
                join chi_tiet_mon_an ctma on ctddm.CTMA_MACT = ctma.CTMA_MACT
                where ddm.KH_MAKH = ? and ctma.MA_MAMON = ?)) > 0 DAMUA
            `
            dbConnect.query(sql, [RatingCustomer, RatingFood, RatingCustomer, RatingFood], (err, result) => {
                if(err)
                    reject(err)
                resolve(result[0].DAMUA)
            })
        })
    }

    async isRated(RatingCustomer, RatingFood){
        return new Promise((resolve, reject) => {
            let sql = `select count(*) DADANHGIA FROM danh_gia where KH_MAKH = ? and MA_MAMON = ?`
            dbConnect.query(sql, [RatingCustomer, RatingFood], (err, result) => {
                if(err)
                    reject(err)
                resolve(result[0].DADANHGIA)
            })
        })
    }

    async create(RatingCustomer, RatingFood, RatingMark)
}

module.exports = Rating