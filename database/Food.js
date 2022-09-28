const dbConnect = require('./dbconnect');

class Food {
    constructor(FoodId, FoodName, FoodType, FoodDescription, FoodImages, FoodPrices) {
        this.FoodId = FoodId;
        this.FoodName = FoodName;
        this.FoodType = FoodType;
        this.FoodDescription = FoodDescription;
        this.FoodImages = FoodImages;
        this.FoodPrices = FoodPrices;
    };

    async getAll() {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                // const sql = "select * from mon_an ma join loai_mon_an lma on ma.LMA_MALOAI = lma.LMA_MALOAI join chi_tiet_mon_an ctma on ma.MA_MAMON=ctma.MA_MAMON join anh_mon_an ama on ma.MA_MAMON=ama.MA_MAMON";
                const sql = `SELECT * , AVG(DG_DIEMDG) DANH_GIA FROM mon_an ma 
                            JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                            JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                            JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                            JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON
                            GROUP BY ma.MA_MAMON, CTMA_MACT, AMA_URL`;
                dbConnect.query(sql, [], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0) {
                            let foods = [];
                            let checked = 0;
                            for (let i = 0; i < result.length - 1; i = checked + 1) {
                                checked = i;
                                let FoodImages = [{
                                    FoodImageUrl: result[i].AMA_URL,
                                    FoodImageDescription: result[i].AMA_TIEU_DE
                                }];
                                let FoodPrices = [{
                                    FoodPrice: result[i].CTMA_MUCGIA,
                                    FoodRation: result[i].CTMA_KHAUPHAN,
                                }];
                                for (let j = i + 1; j < result.length; j++) {
                                    if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                        if (FoodImages.find((image => { return image.FoodImageUrl === result[j].AMA_URL })) == undefined)
                                            FoodImages.push({
                                                FoodImageUrl: result[j].AMA_URL,
                                                FoodImageDescription: result[j].AMA_TIEU_DE
                                            })
                                        if (FoodPrices.find((price => { return price.FoodPrice === result[j].CTMA_MUCGIA })) == undefined)
                                            FoodPrices.push({
                                                FoodPrice: result[j].CTMA_MUCGIA,
                                                FoodRation: result[j].CTMA_KHAUPHAN,
                                            })
                                        checked = j;
                                    } else
                                        break
                                }
                                foods.push({
                                    FoodId: result[i].MA_MAMON,
                                    FoodName: result[i].MA_TENMON,
                                    FoodType: result[i].LMA_TENLOAI,
                                    FoodDescription: result[i].MA_MOTA,
                                    FoodReviewAvg: result[i].DANH_GIA,
                                    FoodThumb: result[i].AMA_URL,
                                    FoodPrices,
                                    FoodImages
                                })

                            }
                            resolve(foods);
                        }
                        else
                            resolve(new Food())
                    }

                })
            })
        });
    }

    async findByFoodName(FoodName) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `SELECT * , AVG(DG_DIEMDG) DANH_GIA FROM mon_an ma 
                            JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                            JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                            JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                            JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON
                            WHERE MA_TENMON LIKE CONCAT('%', ? ,'%')
                            GROUP BY ma.MA_MAMON, CTMA_MACT, AMA_URL`;

                dbConnect.query(sql, [FoodName], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0) {
                            let foods = [];
                            let checked = 0;
                            for (let i = 0; i < result.length; i = checked + 1) {
                                checked = i;
                                let FoodImages = [{
                                    FoodImageUrl: result[i].AMA_URL,
                                    FoodImageDescription: result[i].AMA_TIEU_DE
                                }];
                                let FoodPrices = [{
                                    FoodPrice: result[i].CTMA_MUCGIA,
                                    FoodRation: result[i].CTMA_KHAUPHAN,
                                }];
                                for (let j = i + 1; j < result.length; j++) {
                                    if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                        if (FoodImages.find((image => { return image.FoodImageUrl === result[j].AMA_URL })) == undefined)
                                            FoodImages.push({
                                                FoodImageUrl: result[j].AMA_URL,
                                                FoodImageDescription: result[j].AMA_TIEU_DE
                                            })
                                        if (FoodPrices.find((price => { return price.FoodPrice === result[j].CTMA_MUCGIA })) == undefined)
                                            FoodPrices.push({
                                                FoodPrice: result[j].CTMA_MUCGIA,
                                                FoodRation: result[j].CTMA_KHAUPHAN,
                                            })
                                        checked = j;
                                    } else
                                        break
                                }
                                foods.push({
                                    FoodId: result[i].MA_MAMON,
                                    FoodName: result[i].MA_TENMON,
                                    FoodType: result[i].LMA_TENLOAI,
                                    FoodDescription: result[i].MA_MOTA,
                                    FoodReviewAvg: result[i].DANH_GIA,
                                    FoodThumb: result[i].AMA_URL,
                                    FoodPrices,
                                    FoodImages
                                })
                            }
                            resolve(foods);
                        }
                        else
                            resolve(new Food())
                    }

                })
            })
        });
    }

    async findByFoodType(FoodTypeName) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `SELECT * , AVG(DG_DIEMDG) DANH_GIA FROM mon_an ma 
                            JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                            JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                            JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                            JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON
                            WHERE LMA_TENLOAI = ?
                            GROUP BY ma.MA_MAMON, CTMA_MACT, AMA_URL`;

                dbConnect.query(sql, [FoodTypeName], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0) {
                            let foods = [];
                            let checked = 0;
                            for (let i = 0; i < result.length; i = checked + 1) {
                                checked = i;
                                let FoodImages = [{
                                    FoodImageUrl: result[i].AMA_URL,
                                    FoodImageDescription: result[i].AMA_TIEU_DE
                                }];
                                let FoodPrices = [{
                                    FoodPrice: result[i].CTMA_MUCGIA,
                                    FoodRation: result[i].CTMA_KHAUPHAN,
                                }];
                                for (let j = i + 1; j < result.length; j++) {
                                    if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                        if (FoodImages.find((image => { return image.FoodImageUrl === result[j].AMA_URL })) == undefined)
                                            FoodImages.push({
                                                FoodImageUrl: result[j].AMA_URL,
                                                FoodImageDescription: result[j].AMA_TIEU_DE
                                            })
                                        if (FoodPrices.find((price => { return price.FoodPrice === result[j].CTMA_MUCGIA })) == undefined)
                                            FoodPrices.push({
                                                FoodPrice: result[j].CTMA_MUCGIA,
                                                FoodRation: result[j].CTMA_KHAUPHAN,
                                            })
                                        checked = j;
                                    } else
                                        break
                                }
                                foods.push({
                                    FoodId: result[i].MA_MAMON,
                                    FoodName: result[i].MA_TENMON,
                                    FoodType: result[i].LMA_TENLOAI,
                                    FoodDescription: result[i].MA_MOTA,
                                    FoodReviewAvg: result[i].DANH_GIA,
                                    FoodThumb: result[i].AMA_URL,
                                    FoodPrices,
                                    FoodImages
                                })
                            }
                            resolve(foods);
                        }
                        else
                            resolve(new Food())
                    }

                })
            })
        });
    }

    async findByFoodPrice(FoodPriceMin, FoodPriceMax) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `SELECT * , AVG(DG_DIEMDG) DANH_GIA FROM mon_an ma 
                            JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                            JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                            JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                            JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON
                            WHERE CTMA_MUCGIA >= ? AND CTMA_MUCGIA <= ?
                            GROUP BY ma.MA_MAMON, CTMA_MACT, AMA_URL`;
                dbConnect.query(sql, [FoodPriceMin, FoodPriceMax], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0) {
                            let foods = [];
                            let checked = 0;
                            for (let i = 0; i < result.length; i = checked + 1) {
                                checked = i;
                                let FoodImages = [{
                                    FoodImageUrl: result[i].AMA_URL,
                                    FoodImageDescription: result[i].AMA_TIEU_DE
                                }];
                                let FoodPrices = [{
                                    FoodPrice: result[i].CTMA_MUCGIA,
                                    FoodRation: result[i].CTMA_KHAUPHAN,
                                }];
                                for (let j = i + 1; j < result.length; j++) {
                                    if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                        if (FoodImages.find((image => { return image.FoodImageUrl === result[j].AMA_URL })) == undefined)
                                            FoodImages.push({
                                                FoodImageUrl: result[j].AMA_URL,
                                                FoodImageDescription: result[j].AMA_TIEU_DE
                                            })
                                        if (FoodPrices.find((price => { return price.FoodPrice === result[j].CTMA_MUCGIA })) == undefined)
                                            FoodPrices.push({
                                                FoodPrice: result[j].CTMA_MUCGIA,
                                                FoodRation: result[j].CTMA_KHAUPHAN,
                                            })
                                        checked = j;
                                    } else
                                        break
                                }
                                foods.push({
                                    FoodId: result[i].MA_MAMON,
                                    FoodName: result[i].MA_TENMON,
                                    FoodType: result[i].LMA_TENLOAI,
                                    FoodDescription: result[i].MA_MOTA,
                                    FoodReviewAvg: result[i].DANH_GIA,
                                    FoodThumb: result[i].AMA_URL,
                                    FoodPrices,
                                    FoodImages
                                })
                            }
                            resolve(foods);
                        }
                        else
                            resolve(new Food())
                    }

                })
            })
        });
    }

    async findByFoodRation(FoodRation) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `SELECT * , AVG(DG_DIEMDG) DANH_GIA FROM mon_an ma 
                            JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                            JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                            JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                            JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON
                            WHERE CTMA_KHAUPHAN = ?
                            GROUP BY ma.MA_MAMON, CTMA_MACT, AMA_URL`;
                dbConnect.query(sql, [FoodRation], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0) {
                            let foods = [];
                            let checked = 0;
                            for (let i = 0; i < result.length; i = checked + 1) {
                                checked = i;
                                let FoodImages = [{
                                    FoodImageUrl: result[i].AMA_URL,
                                    FoodImageDescription: result[i].AMA_TIEU_DE
                                }];
                                let FoodPrices = [{
                                    FoodPrice: result[i].CTMA_MUCGIA,
                                    FoodRation: result[i].CTMA_KHAUPHAN,
                                }];
                                for (let j = i + 1; j < result.length; j++) {
                                    if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                        if (FoodImages.find((image => { return image.FoodImageUrl === result[j].AMA_URL })) == undefined)
                                            FoodImages.push({
                                                FoodImageUrl: result[j].AMA_URL,
                                                FoodImageDescription: result[j].AMA_TIEU_DE
                                            })
                                        if (FoodPrices.find((price => { return price.FoodPrice === result[j].CTMA_MUCGIA })) == undefined)
                                            FoodPrices.push({
                                                FoodPrice: result[j].CTMA_MUCGIA,
                                                FoodRation: result[j].CTMA_KHAUPHAN,
                                            })
                                        checked = j;
                                    } else
                                        break
                                }
                                foods.push({
                                    FoodId: result[i].MA_MAMON,
                                    FoodName: result[i].MA_TENMON,
                                    FoodType: result[i].LMA_TENLOAI,
                                    FoodDescription: result[i].MA_MOTA,
                                    FoodReviewAvg: result[i].DANH_GIA,
                                    FoodThumb: result[i].AMA_URL,
                                    FoodPrices,
                                    FoodImages
                                })
                            }
                            resolve(foods);
                        }
                        else
                            resolve(new Food())
                    }

                })
            })
        });
    }

    async findByFoodReview(FoodReview) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `SELECT * FROM
                                    (SELECT ma.MA_MAMON, ma.LMA_MALOAI, ma.MA_TENMON, ma.MA_MOTA, lma.LMA_TENLOAI,  ctma.CTMA_MACT, ctma.CTMA_KHAUPHAN, ctma.CTMA_MUCGIA, ama.AMA_URL, ama.AMA_TIEU_DE , AVG(DG_DIEMDG) as DANH_GIA FROM mon_an ma 
                                    JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                                    JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                                    JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                                    JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON  
                                    GROUP BY ma.MA_MAMON, ctma.CTMA_MACT, ama.AMA_URL) as temp
                            WHERE temp.DANH_GIA >= ?`;
                dbConnect.query(sql, [FoodReview], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0) {
                            let foods = [];
                            let checked = 0;
                            for (let i = 0; i < result.length; i = checked + 1) {
                                checked = i;
                                let FoodImages = [{
                                    FoodImageUrl: result[i].AMA_URL,
                                    FoodImageDescription: result[i].AMA_TIEU_DE
                                }];
                                let FoodPrices = [{
                                    FoodPrice: result[i].CTMA_MUCGIA,
                                    FoodRation: result[i].CTMA_KHAUPHAN,
                                }];
                                for (let j = i + 1; j < result.length; j++) {
                                    if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                        if (FoodImages.find((image => { return image.FoodImageUrl === result[j].AMA_URL })) == undefined)
                                            FoodImages.push({
                                                FoodImageUrl: result[j].AMA_URL,
                                                FoodImageDescription: result[j].AMA_TIEU_DE
                                            })
                                        if (FoodPrices.find((price => { return price.FoodPrice === result[j].CTMA_MUCGIA })) == undefined)
                                            FoodPrices.push({
                                                FoodPrice: result[j].CTMA_MUCGIA,
                                                FoodRation: result[j].CTMA_KHAUPHAN,
                                            })
                                        checked = j;
                                    } else
                                        break
                                }
                                foods.push({
                                    FoodId: result[i].MA_MAMON,
                                    FoodName: result[i].MA_TENMON,
                                    FoodType: result[i].LMA_TENLOAI,
                                    FoodDescription: result[i].MA_MOTA,
                                    FoodReviewAvg: result[i].DANH_GIA,
                                    FoodThumb: result[i].AMA_URL,
                                    FoodPrices,
                                    FoodImages
                                })
                            }
                            resolve(foods);
                        }
                        else
                            resolve(new Food())
                    }

                })
            })
        });
    }

    async filterFoods(FoodName, FoodTypeName, FoodPriceMin, FoodPriceMax, FoodRation, FoodReview) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                let sql = `SELECT * FROM
                                    (SELECT ma.MA_MAMON, ma.LMA_MALOAI, ma.MA_TENMON, ma.MA_MOTA, lma.LMA_TENLOAI,  ctma.CTMA_MACT, ctma.CTMA_KHAUPHAN, ctma.CTMA_MUCGIA, ama.AMA_URL, ama.AMA_TIEU_DE , AVG(DG_DIEMDG) as DANH_GIA FROM mon_an ma 
                                    JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                                    JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                                    JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                                    JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON  
                                    GROUP BY ma.MA_MAMON, ctma.CTMA_MACT, ama.AMA_URL) as temp
                            WHERE `;
                let sqlArray = []
                if (FoodName != undefined && FoodName!='') {
                    if (sqlArray.length > 0)
                        sql = sql.concat(` AND `)
                    sql = sql.concat(` temp.MA_TENMON LIKE CONCAT('%',?,'%')`)
                    sqlArray.push(FoodName)
                }
                if (FoodTypeName != undefined) {
                    if (sqlArray.length > 0)
                        sql = sql.concat(` AND `)
                    sql = sql.concat(` temp.LMA_TENLOAI = ? `)
                    sqlArray.push(FoodTypeName)
                }
                if (FoodPriceMin != undefined) {
                    if (sqlArray.length > 0)
                        sql = sql.concat(` AND `)
                    sql = sql.concat(` temp.CTMA_MUCGIA >= ? `)
                    sqlArray.push(FoodPriceMin)
                }
                if (FoodPriceMax != undefined) {
                    if (sqlArray.length > 0)
                        sql = sql.concat(` AND `)
                    sql = sql.concat(` temp.CTMA_MUCGIA <= ? `)
                    sqlArray.push(FoodPriceMax)
                }
                if (FoodRation != undefined) {
                    if (sqlArray.length > 0)
                        sql = sql.concat(` AND `)
                    sql = sql.concat(` temp.CTMA_KHAUPHAN = ?  `)
                    sqlArray.push(FoodRation)
                }
                if (FoodReview != undefined) {
                    if (sqlArray.length > 0)
                        sql = sql.concat(` AND `)
                    sql = sql.concat(` temp.DANH_GIA >= ? `)
                    sqlArray.push(FoodReview)
                }
                dbConnect.query(sql, sqlArray, (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0) {
                            let foods = [];
                            let checked = 0;
                            for (let i = 0; i < result.length; i = checked + 1) {
                                checked = i;
                                let FoodImages = [{
                                    FoodImageUrl: result[i].AMA_URL,
                                    FoodImageDescription: result[i].AMA_TIEU_DE
                                }];
                                let FoodPrices = [{
                                    FoodPrice: result[i].CTMA_MUCGIA,
                                    FoodRation: result[i].CTMA_KHAUPHAN,
                                }];
                                for (let j = i + 1; j < result.length; j++) {
                                    if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                        if (FoodImages.find((image => { return image.FoodImageUrl === result[j].AMA_URL })) == undefined)
                                            FoodImages.push({
                                                FoodImageUrl: result[j].AMA_URL,
                                                FoodImageDescription: result[j].AMA_TIEU_DE
                                            })
                                        if (FoodPrices.find((price => { return price.FoodPrice === result[j].CTMA_MUCGIA })) == undefined)
                                            FoodPrices.push({
                                                FoodPrice: result[j].CTMA_MUCGIA,
                                                FoodRation: result[j].CTMA_KHAUPHAN,
                                            })
                                        checked = j;
                                    } else
                                        break
                                }
                                foods.push({
                                    FoodId: result[i].MA_MAMON,
                                    FoodName: result[i].MA_TENMON,
                                    FoodType: result[i].LMA_TENLOAI,
                                    FoodDescription: result[i].MA_MOTA,
                                    FoodReviewAvg: result[i].DANH_GIA,
                                    FoodThumb: result[i].AMA_URL,
                                    FoodPrices,
                                    FoodImages
                                })
                            }
                            resolve(foods);
                        }
                        else
                            resolve(new Food())
                    }

                })
            })
        });
    }
}

module.exports = Food;