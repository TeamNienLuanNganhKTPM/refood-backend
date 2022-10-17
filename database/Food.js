const dbConnect = require('./dbconnect');

class Food {
    constructor(FoodId, FoodName, FoodSlug, FoodType, FoodDescription, FoodReviewAvg, FoodThumb, FoodPrices, FoodImages) {
        this.FoodId = FoodId;
        this.FoodName = FoodName;
        this.FoodSlug = FoodSlug;
        this.FoodType = FoodType;
        this.FoodDescription = FoodDescription;
        this.FoodReviewAvg = FoodReviewAvg;
        this.FoodThumb = FoodThumb;
        this.FoodPrices = FoodPrices;
        this.FoodImages = FoodImages;
    };

    async getAll() {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `SELECT * ,ma.MA_MAMON, toSlug(ma.MA_TENMON) FOOD_SLUG, AVG(DG_DIEMDG) DANH_GIA FROM mon_an ma 
                            JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                            JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                            JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                            LEFT JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON
                            GROUP BY ma.MA_MAMON, CTMA_MACT, AMA_URL`;
                dbConnect.query(sql, [], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0) {
                            console.log(result)

                            let foods = [];
                            let checked = 0;
                            for (let i = 0; i < result.length - 1; i = checked + 1) {
                                checked = i;
                                let FoodImages = [{
                                    FoodImageUrl: result[i].AMA_URL,
                                    FoodImageDescription: result[i].AMA_TIEU_DE
                                }];

                                let FoodPrices = [{
                                    FoodDetailID: result[i].CTMA_MACT,
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
                                        if (FoodPrices.find((price => { return price.FoodDetailID === result[j].CTMA_MACT })) == undefined)
                                            FoodPrices.push({
                                                FoodDetailID: result[j].CTMA_MACT,
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
                                    FoodSlug: result[i].FOOD_SLUG,
                                    FoodTypeName: result[i].LMA_TENLOAI,
                                    FoodTypeID: result[i].LMA_MALOAI,
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
                const sql = `SELECT * ,ma.MA_MAMON, toSlug(ma.MA_TENMON) FOOD_SLUG, AVG(DG_DIEMDG) DANH_GIA FROM mon_an ma 
                            JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                            JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                            JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                            LEFT JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON
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
                                    FoodDetailID: result[i].CTMA_MACT,
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
                                        if (FoodPrices.find((price => { return price.FoodDetailID === result[j].CTMA_MACT })) == undefined)
                                            FoodPrices.push({
                                                FoodDetailID: result[j].CTMA_MACT,
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
                                    FoodSlug: result[i].FOOD_SLUG,
                                    FoodTypeName: result[i].LMA_TENLOAI,
                                    FoodTypeID: result[i].LMA_MALOAI,
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
                const sql = `SELECT * ,ma.MA_MAMON, toSlug(ma.MA_TENMON) FOOD_SLUG, AVG(DG_DIEMDG) DANH_GIA FROM mon_an ma 
                            JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                            JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                            JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                            LEFT JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON
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
                                    FoodDetailID: result[i].CTMA_MACT,
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
                                        if (FoodPrices.find((price => { return price.FoodDetailID === result[j].CTMA_MACT })) == undefined)
                                            FoodPrices.push({
                                                FoodDetailID: result[j].CTMA_MACT,
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
                                    FoodSlug: result[i].FOOD_SLUG,
                                    FoodTypeName: result[i].LMA_TENLOAI,
                                    FoodTypeID: result[i].LMA_MALOAI,
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
                const sql = `SELECT * ,ma.MA_MAMON, toSlug(ma.MA_TENMON) FOOD_SLUG, AVG(DG_DIEMDG) DANH_GIA FROM mon_an ma 
                            JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                            JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                            JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                            LEFT JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON
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
                                    FoodDetailID: result[i].CTMA_MACT,
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
                                        if (FoodPrices.find((price => { return price.FoodDetailID === result[j].CTMA_MACT })) == undefined)
                                            FoodPrices.push({
                                                FoodDetailID: result[j].CTMA_MACT,
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
                                    FoodSlug: result[i].FOOD_SLUG,
                                    FoodTypeName: result[i].LMA_TENLOAI,
                                    FoodTypeID: result[i].LMA_MALOAI,
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
                const sql = `SELECT * ,ma.MA_MAMON, toSlug(ma.MA_TENMON) FOOD_SLUG, AVG(DG_DIEMDG) DANH_GIA FROM mon_an ma 
                            JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                            JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                            JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                            LEFT JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON
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
                                    FoodDetailID: result[i].CTMA_MACT,
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
                                        if (FoodPrices.find((price => { return price.FoodDetailID === result[j].CTMA_MACT })) == undefined)
                                            FoodPrices.push({
                                                FoodDetailID: result[j].CTMA_MACT,
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
                                    FoodSlug: result[i].FOOD_SLUG,
                                    FoodTypeName: result[i].LMA_TENLOAI,
                                    FoodTypeID: result[i].LMA_MALOAI,
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
                                    LEFT JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON  
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
                                    FoodDetailID: result[i].CTMA_MACT,
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
                                        if (FoodPrices.find((price => { return price.FoodDetailID === result[j].CTMA_MACT })) == undefined)
                                            FoodPrices.push({
                                                FoodDetailID: result[j].CTMA_MACT,
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
                                    FoodSlug: result[i].FOOD_SLUG,
                                    FoodTypeName: result[i].LMA_TENLOAI,
                                    FoodTypeID: result[i].LMA_MALOAI,
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
                                    (SELECT ma.MA_MAMON, ma.LMA_MALOAI, ma.MA_TENMON, toSlug(ma.MA_TENMON) FOOD_SLUG, ma.MA_MOTA, lma.LMA_TENLOAI,  ctma.CTMA_MACT, ctma.CTMA_KHAUPHAN, ctma.CTMA_MUCGIA, ama.AMA_URL, ama.AMA_TIEU_DE , AVG(DG_DIEMDG) as DANH_GIA FROM mon_an ma 
                                    JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                                    JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                                    JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                                    LEFT JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON  
                                    GROUP BY ma.MA_MAMON, ctma.CTMA_MACT, ama.AMA_URL) as temp
                            WHERE `;
                let sqlArray = []
                if (FoodName != undefined && FoodName != '') {
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
                                    FoodDetailID: result[i].CTMA_MACT,
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
                                        if (FoodPrices.find((price => { return price.FoodDetailID === result[j].CTMA_MACT })) == undefined)
                                            FoodPrices.push({
                                                FoodDetailID: result[j].CTMA_MACT,
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
                                    FoodSlug: result[i].FOOD_SLUG,
                                    FoodTypeName: result[i].LMA_TENLOAI,
                                    FoodTypeID: result[i].LMA_MALOAI,
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

    async getDetails(FoodId) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                let sql = `SELECT * FROM
                                    (SELECT ma.MA_MAMON, ma.LMA_MALOAI, ma.MA_TENMON, toSlug(ma.MA_TENMON) FOOD_SLUG, ma.MA_MOTA, lma.LMA_TENLOAI, lma.LMA_MALOAI, ctma.CTMA_MACT, ctma.CTMA_KHAUPHAN, ctma.CTMA_MUCGIA, ama.AMA_URL, ama.AMA_TIEU_DE , AVG(DG_DIEMDG) as DANH_GIA FROM mon_an ma 
                                    JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                                    JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                                    JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                                    LEFT JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON 
                                    GROUP BY ma.MA_MAMON, ctma.CTMA_MACT, ama.AMA_URL) 
                                    as temp
                            WHERE MA_MAMON = ?`;
                //, bl.BL_MABL, bl.KH_MAKH, kh.KH_TENKH, bl.BL_NOIDUNG, bl.BL_THOIGIANBL 
                // ORDER BY BL_THOIGIANBL desc`;
                // FULL OUTER JOIN binh_luan bl ON temp.MA_MAMON = bl.MA_MAMON
                // JOIN khach_hang kh ON kh.KH_MAKH = bl.KH_MAKH
                dbConnect.query(sql, [FoodId], (err, result) => {
                    if (err) {
                        console.log(err)
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
                                    FoodDetailID: result[i].CTMA_MACT,
                                    FoodPrice: result[i].CTMA_MUCGIA,
                                    FoodRation: result[i].CTMA_KHAUPHAN,
                                }];
                                // let FoodComments = [{
                                //     FoodCommentID: result[i].BL_MABL,
                                //     FoodCommentOwnerID: result[i].KH_MAKH,
                                //     FoodCommentOwnerName: result[i].KH_TENKH,
                                //     FoodCommentContent: result[i].BL_NOIDUNG,
                                //     FoodCommentTime: result[i].BL_THOIGIANBL,
                                // }]
                                for (let j = i + 1; j < result.length; j++) {
                                    if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                        if (FoodImages.find((image => { return image.FoodImageUrl === result[j].AMA_URL })) == undefined)
                                            FoodImages.push({
                                                FoodImageUrl: result[j].AMA_URL,
                                                FoodImageDescription: result[j].AMA_TIEU_DE
                                            })
                                        if (FoodPrices.find((price => { return price.FoodDetailID === result[j].CTMA_MACT })) == undefined)
                                            FoodPrices.push({
                                                FoodDetailID: result[j].CTMA_MACT,
                                                FoodPrice: result[j].CTMA_MUCGIA,
                                                FoodRation: result[j].CTMA_KHAUPHAN,
                                            })
                                        // if (FoodComments.find((comment => { return comment.FoodCommentId === result[j].BL_MABL })) == undefined)
                                        //     FoodComments.push({
                                        //         FoodCommentId: result[j].BL_MABL,
                                        //         FoodCommentOwnerID: result[j].KH_MAKH,
                                        //         FoodCommentOwnerName: result[j].KH_TENKH,
                                        //         FoodCommentContent: result[j].BL_NOIDUNG,
                                        //         FoodCommentTime: result[j].BL_THOIGIANBL,
                                        //     })
                                        checked = j;
                                    } else
                                        break
                                }
                                foods.push({
                                    FoodId: result[i].MA_MAMON,
                                    FoodName: result[i].MA_TENMON,
                                    FoodSlug: result[i].FOOD_SLUG,
                                    FoodTypeName: result[i].LMA_TENLOAI,
                                    FoodTypeID: result[i].LMA_MALOAI,
                                    FoodDescription: result[i].MA_MOTA,
                                    FoodReviewAvg: result[i].DANH_GIA,
                                    FoodThumb: result[i].AMA_URL,
                                    FoodPrices,
                                    FoodImages
                                    // FoodComments
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

    async getDetailsSlug(tenMonAn) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                let sql = `SELECT * FROM
                                    (SELECT ma.MA_MAMON, ma.LMA_MALOAI, ma.MA_TENMON, toSlug(ma.MA_TENMON) FOOD_SLUG, ma.MA_MOTA, lma.LMA_TENLOAI,  ctma.CTMA_MACT, ctma.CTMA_KHAUPHAN, ctma.CTMA_MUCGIA, ama.AMA_URL, ama.AMA_TIEU_DE , AVG(DG_DIEMDG) as DANH_GIA FROM mon_an ma 
                                    JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                                    JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                                    JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                                    LEFT JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON 
                                    GROUP BY ma.MA_MAMON, ctma.CTMA_MACT, ama.AMA_URL) 
                                    as temp
                            WHERE MA_MAMON = FindFoodIdBySlug(?)`;
                dbConnect.query(sql, [tenMonAn], (err, result) => {
                    if (err) {
                        console.log(err)
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
                                    FoodDetailID: result[i].CTMA_MACT,
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
                                        if (FoodPrices.find((price => { return price.FoodDetailID === result[j].CTMA_MACT })) == undefined)
                                            FoodPrices.push({
                                                FoodDetailID: result[j].CTMA_MACT,
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
                                    FoodSlug: result[i].FOOD_SLUG,
                                    FoodTypeName: result[i].LMA_TENLOAI,
                                    FoodTypeID: result[i].LMA_MALOAI,
                                    FoodDescription: result[i].MA_MOTA,
                                    FoodReviewAvg: result[i].DANH_GIA,
                                    FoodThumb: result[i].AMA_URL,
                                    FoodPrices,
                                    FoodImages
                                    // FoodComments
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