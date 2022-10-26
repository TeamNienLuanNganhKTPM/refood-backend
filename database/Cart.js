const { resolve } = require('path');
const dbConnect = require('./dbconnect');

class Cart {
    constructor(CartFoodDetail, CartFoodCount) {
        this.CartFoodDetail = CartFoodDetail
        this.CartFoodCount = CartFoodCount
    }
    async getCartDetail(CustomerId) {
        return new Promise((resolve, reject) => {
            const sql = `
                    SELECT ma.MA_MAMON, ma.MA_TENMON, toSlug(ma.MA_TENMON) FOODSLUG, lma.LMA_TENLOAI, ma.MA_MOTA, ctgmna.CTMA_MACT, ctma.CTMA_MUCGIA, ctma.CTMA_KHAUPHAN, ctgmna.CTGMA_SOLUONG, ama.AMA_URL, ama.AMA_TIEU_DE
                    FROM chi_tiet_gio_mon_an ctgmna 
                    JOIN chi_tiet_mon_an ctma ON ctgmna.CTMA_MACT = ctma.CTMA_MACT
                    JOIN mon_an ma ON ma.MA_MAMON = ctma.MA_MAMON
                    JOIN anh_mon_an ama ON ama.MA_MAMON = ma.MA_MAMON
                    JOIN loai_mon_an lma on lma.LMA_MALOAI = ma.LMA_MALOAI
                    WHERE KH_MAKH = ?
                    GROUP BY (CTMA_MACT)`;
            dbConnect.query(sql, [CustomerId], (err, result) => {
                if (err) {
                    return reject(err)
                }
                else {
                    let cartDetails = []
                    result.forEach(element => {
                        cartDetails.push({
                            FoodId: element.MA_MAMON,
                            FoodName: element.MA_TENMON,
                            FoodType: element.LMA_TENLOAI,
                            FoodSlug: element.FOODSLUG,
                            FoodDescription: element.MA_MOTA,
                            FoodThumb: `https://drive.google.com/uc?id=${element.AMA_URL}`,
                            FoodThumbDescription: element.AMA_TIEU_DE,
                            FoodDetailID: element.CTMA_MACT,
                            FoodPrice: element.CTMA_MUCGIA,
                            FoodRation: element.CTMA_KHAUPHAN,
                            FoodDishCount: element.CTGMA_SOLUONG
                        })
                    });
                    resolve(cartDetails)
                }
            })
        });
    }

    async getCartSubTotal(CustomerId) {
        return new Promise((resolve, reject) => {
            const sql = `
                    SELECT ma.MA_MAMON, ma.MA_TENMON, toSlug(ma.MA_TENMON) FOODSLUG, lma.LMA_TENLOAI, ma.MA_MOTA, ctgmna.CTMA_MACT, ctma.CTMA_MUCGIA, ctma.CTMA_KHAUPHAN, ctgmna.CTGMA_SOLUONG, ama.AMA_URL, ama.AMA_TIEU_DE
                    FROM chi_tiet_gio_mon_an ctgmna 
                    JOIN chi_tiet_mon_an ctma ON ctgmna.CTMA_MACT = ctma.CTMA_MACT
                    JOIN mon_an ma ON ma.MA_MAMON = ctma.MA_MAMON
                    JOIN anh_mon_an ama ON ama.MA_MAMON = ma.MA_MAMON
                    JOIN loai_mon_an lma on lma.LMA_MALOAI = ma.LMA_MALOAI
                    WHERE KH_MAKH = ?
                    GROUP BY (CTMA_MACT)`;
            dbConnect.query(sql, [CustomerId], (err, result) => {
                if (err) {
                    return reject(err)
                }
                let cartSubTotal = 0
                result.forEach(element => {
                    cartSubTotal += element.CTMA_MUCGIA * element.CTGMA_SOLUONG
                })
                resolve(cartSubTotal)
            })
        });
    }
    async getCartSubTotalForParty(CustomerId, NumberOfTable) {
        return new Promise((resolve, reject) => {
            const sql = `
                    SELECT ma.MA_MAMON, ma.MA_TENMON, toSlug(ma.MA_TENMON) FOODSLUG, lma.LMA_TENLOAI, ma.MA_MOTA, ctgmna.CTMA_MACT, ctma.CTMA_MUCGIA, ctma.CTMA_KHAUPHAN, ctgmna.CTGMA_SOLUONG, ama.AMA_URL, ama.AMA_TIEU_DE
                    FROM chi_tiet_gio_mon_an ctgmna 
                    JOIN chi_tiet_mon_an ctma ON ctgmna.CTMA_MACT = ctma.CTMA_MACT
                    JOIN mon_an ma ON ma.MA_MAMON = ctma.MA_MAMON
                    JOIN anh_mon_an ama ON ama.MA_MAMON = ma.MA_MAMON
                    JOIN loai_mon_an lma on lma.LMA_MALOAI = ma.LMA_MALOAI
                    WHERE KH_MAKH = ?
                    GROUP BY (CTMA_MACT)`;
            dbConnect.query(sql, [CustomerId], (err, result) => {
                if (err) {
                    return reject(err)
                }
                let cartSubTotal = 0
                result.forEach(element => {
                    cartSubTotal += element.CTMA_MUCGIA * NumberOfTable
                })
                resolve(cartSubTotal)
            })
        });
    }
    async addToCart(CustomerId, CartFoodDetail, CartFoodCount) {
        return new Promise((resolve, reject) => {
            const sql = `
                        call CAP_NHAT_GIO_MON_AN(?,?,?)`;
            dbConnect.query(sql, [CustomerId, CartFoodDetail, CartFoodCount], (err, result) => {
                if (err) {
                    return reject(err)
                }
                else {
                    resolve(result.affectedRows)
                }

            })
        });
    }

    async updateCart(CustomerId, CartFoodDetail, CartFoodCount) {
        return new Promise((resolve, reject) => {
            const sql = `
                update chi_tiet_gio_mon_an set CTGMA_SOLUONG = ? where KH_MAKH = ? AND CTMA_MACT = ?`;
            dbConnect.query(sql, [CartFoodCount, CustomerId, CartFoodDetail], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve(result.affectedRows)
            })
        });
    }

    async deleteFromCart(CustomerId, CartFoodDetail) {
        return new Promise((resolve, reject) => {
            const sql = `
                DELETE FROM chi_tiet_gio_mon_an 
                WHERE KH_MAKH = ? and CTMA_MACT = ? `;
            dbConnect.query(sql, [CustomerId, CartFoodDetail], (err, result) => {
                if (err) {
                    return reject(err)
                }
                else {
                    resolve(result.affectedRows)
                }
            })
        });
    }

    async verifyCartForParty(CustomerId) {
        return new Promise((resolve, reject) => {
            const sql = `
                    SELECT ma.MA_MAMON, ma.MA_TENMON, toSlug(ma.MA_TENMON) FOODSLUG, lma.LMA_TENLOAI, ma.MA_MOTA, ctgmna.CTMA_MACT, ctma.CTMA_MUCGIA, ctma.CTMA_KHAUPHAN, ctgmna.CTGMA_SOLUONG, ama.AMA_URL, ama.AMA_TIEU_DE
                    FROM chi_tiet_gio_mon_an ctgmna 
                    JOIN chi_tiet_mon_an ctma ON ctgmna.CTMA_MACT = ctma.CTMA_MACT
                    JOIN mon_an ma ON ma.MA_MAMON = ctma.MA_MAMON
                    JOIN anh_mon_an ama ON ama.MA_MAMON = ma.MA_MAMON
                    JOIN loai_mon_an lma on lma.LMA_MALOAI = ma.LMA_MALOAI
                    WHERE KH_MAKH = ?
                    GROUP BY (CTMA_MACT)`;
            dbConnect.query(sql, [CustomerId], (err, result) => {
                if (err) {
                    return reject(err)
                }
                else {
                    let availableForParty = true;
                    result.forEach(e => {
                        if (e.CTMA_KHAUPHAN != 10) {
                            availableForParty = false
                        }
                    })
                    resolve(availableForParty)
                }
            })
        });
    }
}
module.exports = Cart