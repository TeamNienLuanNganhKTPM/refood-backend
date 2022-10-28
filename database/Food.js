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
                        let foods = [];
                        let checked = 0;
                        for (let i = 0; i < result.length - 1; i = checked + 1) {
                            checked = i;
                            let FoodImages = [{
                                FoodImageUrl: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
                                FoodImageDescription: result[i].AMA_TIEU_DE
                            }];

                            let FoodPrices = [{
                                FoodDetailID: result[i].CTMA_MACT,
                                FoodPrice: result[i].CTMA_MUCGIA,
                                FoodRation: result[i].CTMA_KHAUPHAN,
                            }];
                            for (let j = i + 1; j < result.length; j++) {
                                if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                    if (FoodImages.find((image => { return image.FoodImageUrl === `https://drive.google.com/uc?id=${result[j].AMA_URL}` })) == undefined)
                                        FoodImages.push({
                                            FoodImageUrl: `https://drive.google.com/uc?id=${result[j].AMA_URL}`,
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
                                FoodThumb: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
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
        });
    }

    async getPopularFood(limit) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * ,ma.MA_MAMON, toSlug(ma.MA_TENMON) FOOD_SLUG, AVG(DG_DIEMDG) DANH_GIA FROM mon_an ma 
                JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                LEFT JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON 
                WHERE ma.MA_MAMON IN 
                    (select ctma.MA_MAMON from chi_tiet_mon_an ctma 
                        join (SELECT CTMA_MACT, count(CTMA_MACT) Popular 
                        FROM chi_tiet_don_dat_mon 
                        GROUP BY (CTMA_MACT) 
                        ORDER BY Popular DESC LIMIT ?) top 
                        on ctma.CTMA_MACT = top.CTMA_MACT 
                        join mon_an ma on ma.MA_MAMON = ctma.MA_MAMON) 
                GROUP BY ma.MA_MAMON, CTMA_MACT, AMA_URL`;
            dbConnect.query(sql, [limit], (err, result) => {
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
                                FoodImageUrl: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
                                FoodImageDescription: result[i].AMA_TIEU_DE
                            }];

                            let FoodPrices = [{
                                FoodDetailID: result[i].CTMA_MACT,
                                FoodPrice: result[i].CTMA_MUCGIA,
                                FoodRation: result[i].CTMA_KHAUPHAN,
                            }];
                            for (let j = i + 1; j < result.length; j++) {
                                if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                    if (FoodImages.find((image => { return image.FoodImageUrl === `https://drive.google.com/uc?id=${result[j].AMA_URL}` })) == undefined)
                                        FoodImages.push({
                                            FoodImageUrl: `https://drive.google.com/uc?id=${result[j].AMA_URL}`,
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
                                FoodThumb: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
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
        });
    }

    async getNewFood(limit) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * ,ma.MA_MAMON, toSlug(ma.MA_TENMON) FOOD_SLUG, AVG(DG_DIEMDG) DANH_GIA FROM mon_an ma 
                JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                LEFT JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON 
                GROUP BY ma.MA_MAMON, CTMA_MACT, AMA_URL
                order by ma.count DESC`;
            dbConnect.query(sql, [limit], (err, result) => {
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
                                FoodImageUrl: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
                                FoodImageDescription: result[i].AMA_TIEU_DE
                            }];

                            let FoodPrices = [{
                                FoodDetailID: result[i].CTMA_MACT,
                                FoodPrice: result[i].CTMA_MUCGIA,
                                FoodRation: result[i].CTMA_KHAUPHAN,
                            }];
                            for (let j = i + 1; j < result.length; j++) {
                                if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                    if (FoodImages.find((image => { return image.FoodImageUrl === `https://drive.google.com/uc?id=${result[j].AMA_URL}` })) == undefined)
                                        FoodImages.push({
                                            FoodImageUrl: `https://drive.google.com/uc?id=${result[j].AMA_URL}`,
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
                                FoodThumb: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
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
        });
    }

    async findByFoodName(FoodName) {
        return new Promise((resolve, reject) => {
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
                                FoodImageUrl: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
                                FoodImageDescription: result[i].AMA_TIEU_DE
                            }];
                            let FoodPrices = [{
                                FoodDetailID: result[i].CTMA_MACT,
                                FoodPrice: result[i].CTMA_MUCGIA,
                                FoodRation: result[i].CTMA_KHAUPHAN,
                            }];
                            for (let j = i + 1; j < result.length; j++) {
                                if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                    if (FoodImages.find((image => { return image.FoodImageUrl === `https://drive.google.com/uc?id=${result[j].AMA_URL}` })) == undefined)
                                        FoodImages.push({
                                            FoodImageUrl: `https://drive.google.com/uc?id=${result[j].AMA_URL}`,
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
                                FoodThumb: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
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
        });
    }

    async findByFoodType(FoodTypeName) {
        return new Promise((resolve, reject) => {
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
                                FoodImageUrl: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
                                FoodImageDescription: result[i].AMA_TIEU_DE
                            }];
                            let FoodPrices = [{
                                FoodDetailID: result[i].CTMA_MACT,
                                FoodPrice: result[i].CTMA_MUCGIA,
                                FoodRation: result[i].CTMA_KHAUPHAN,
                            }];
                            for (let j = i + 1; j < result.length; j++) {
                                if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                    if (FoodImages.find((image => { return image.FoodImageUrl === `https://drive.google.com/uc?id=${result[j].AMA_URL}` })) == undefined)
                                        FoodImages.push({
                                            FoodImageUrl: `https://drive.google.com/uc?id=${result[j].AMA_URL}`,
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
                                FoodThumb: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
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
        });
    }

    async findByFoodPrice(FoodPriceMin, FoodPriceMax) {
        return new Promise((resolve, reject) => {
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
                                FoodImageUrl: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
                                FoodImageDescription: result[i].AMA_TIEU_DE
                            }];
                            let FoodPrices = [{
                                FoodDetailID: result[i].CTMA_MACT,
                                FoodPrice: result[i].CTMA_MUCGIA,
                                FoodRation: result[i].CTMA_KHAUPHAN,
                            }];
                            for (let j = i + 1; j < result.length; j++) {
                                if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                    if (FoodImages.find((image => { return image.FoodImageUrl === `https://drive.google.com/uc?id=${result[j].AMA_URL}` })) == undefined)
                                        FoodImages.push({
                                            FoodImageUrl: `https://drive.google.com/uc?id=${result[j].AMA_URL}`,
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
                                FoodThumb: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
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
        });
    }

    async findByFoodRation(FoodRation) {
        return new Promise((resolve, reject) => {
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
                                FoodImageUrl: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
                                FoodImageDescription: result[i].AMA_TIEU_DE
                            }];
                            let FoodPrices = [{
                                FoodDetailID: result[i].CTMA_MACT,
                                FoodPrice: result[i].CTMA_MUCGIA,
                                FoodRation: result[i].CTMA_KHAUPHAN,
                            }];
                            for (let j = i + 1; j < result.length; j++) {
                                if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                    if (FoodImages.find((image => { return image.FoodImageUrl === `https://drive.google.com/uc?id=${result[j].AMA_URL}` })) == undefined)
                                        FoodImages.push({
                                            FoodImageUrl: `https://drive.google.com/uc?id=${result[j].AMA_URL}`,
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
                                FoodThumb: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
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
        });
    }

    async findByFoodReview(FoodReview) {
        return new Promise((resolve, reject) => {
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
                                FoodImageUrl: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
                                FoodImageDescription: result[i].AMA_TIEU_DE
                            }];
                            let FoodPrices = [{
                                FoodDetailID: result[i].CTMA_MACT,
                                FoodPrice: result[i].CTMA_MUCGIA,
                                FoodRation: result[i].CTMA_KHAUPHAN,
                            }];
                            for (let j = i + 1; j < result.length; j++) {
                                if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                    if (FoodImages.find((image => { return image.FoodImageUrl === `https://drive.google.com/uc?id=${result[j].AMA_URL}` })) == undefined)
                                        FoodImages.push({
                                            FoodImageUrl: `https://drive.google.com/uc?id=${result[j].AMA_URL}`,
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
                                FoodThumb: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
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
        });
    }

    async filterFoods(FoodName, FoodTypeName, FoodPriceMin, FoodPriceMax, FoodRation, FoodReview) {
        return new Promise((resolve, reject) => {
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
                                FoodImageUrl: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
                                FoodImageDescription: result[i].AMA_TIEU_DE
                            }];
                            let FoodPrices = [{
                                FoodDetailID: result[i].CTMA_MACT,
                                FoodPrice: result[i].CTMA_MUCGIA,
                                FoodRation: result[i].CTMA_KHAUPHAN,
                            }];
                            for (let j = i + 1; j < result.length; j++) {
                                if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                    if (FoodImages.find((image => { return image.FoodImageUrl === `https://drive.google.com/uc?id=${result[j].AMA_URL}` })) == undefined)
                                        FoodImages.push({
                                            FoodImageUrl: `https://drive.google.com/uc?id=${result[j].AMA_URL}`,
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
                                FoodThumb: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
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
        });
    }

    async getDetails(FoodId) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM
                                    (SELECT ma.MA_MAMON, ma.LMA_MALOAI, ma.MA_TENMON, toSlug(ma.MA_TENMON) FOOD_SLUG, ma.MA_MOTA, lma.LMA_TENLOAI, ctma.CTMA_MACT, ctma.CTMA_KHAUPHAN, ctma.CTMA_MUCGIA, ama.AMA_URL, ama.AMA_TIEU_DE , AVG(DG_DIEMDG) as DANH_GIA FROM mon_an ma 
                                    JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                                    JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                                    JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                                    LEFT JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON 
                                    GROUP BY ma.MA_MAMON, ctma.CTMA_MACT, ama.AMA_URL) 
                                    as temp
                            WHERE MA_MAMON = ?`;
            dbConnect.query(sql, [FoodId], (err, result) => {
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
                                FoodImageUrl: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
                                FoodImageDescription: result[i].AMA_TIEU_DE
                            }];
                            let FoodPrices = [{
                                FoodDetailID: result[i].CTMA_MACT,
                                FoodPrice: result[i].CTMA_MUCGIA,
                                FoodRation: result[i].CTMA_KHAUPHAN,
                            }];
                            for (let j = i + 1; j < result.length; j++) {
                                if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                    if (FoodImages.find((image => { return image.FoodImageUrl === `https://drive.google.com/uc?id=${result[j].AMA_URL}` })) == undefined)
                                        FoodImages.push({
                                            FoodImageUrl: `https://drive.google.com/uc?id=${result[j].AMA_URL}`,
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
                                FoodThumb: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
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
        });
    }

    async getDetailsSlug(tenMonAn) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM
                                    (SELECT ma.MA_MAMON, ma.LMA_MALOAI, ma.MA_TENMON, toSlug(ma.MA_TENMON) FOOD_SLUG, ma.MA_MOTA, lma.LMA_TENLOAI,  ctma.CTMA_MACT, ctma.CTMA_KHAUPHAN, ctma.CTMA_MUCGIA, ama.AMA_URL, ama.AMA_TIEU_DE , AVG(DG_DIEMDG) as DANH_GIA 
                                    FROM mon_an ma 
                                    JOIN loai_mon_an lma ON ma.LMA_MALOAI = lma.LMA_MALOAI 
                                    JOIN chi_tiet_mon_an ctma ON ma.MA_MAMON=ctma.MA_MAMON 
                                    JOIN anh_mon_an ama ON ma.MA_MAMON=ama.MA_MAMON 
                                    LEFT JOIN danh_gia dg ON ma.MA_MAMON=dg.MA_MAMON 
                                    GROUP BY ma.MA_MAMON, ctma.CTMA_MACT, ama.AMA_URL) 
                                    as temp
                            WHERE MA_MAMON = FindFoodIdBySlug(?)`;
            dbConnect.query(sql, [tenMonAn], (err, result) => {
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
                                FoodImageUrl: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
                                FoodImageDescription: result[i].AMA_TIEU_DE
                            }];
                            let FoodPrices = [{
                                FoodDetailID: result[i].CTMA_MACT,
                                FoodPrice: result[i].CTMA_MUCGIA,
                                FoodRation: result[i].CTMA_KHAUPHAN,
                            }];
                            for (let j = i + 1; j < result.length; j++) {
                                if (result[i].MA_MAMON === result[j].MA_MAMON) {
                                    if (FoodImages.find((image => { return image.FoodImageUrl === `https://drive.google.com/uc?id=${result[j].AMA_URL}` })) == undefined)
                                        FoodImages.push({
                                            FoodImageUrl: `https://drive.google.com/uc?id=${result[j].AMA_URL}`,
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
                                FoodThumb: `https://drive.google.com/uc?id=${result[i].AMA_URL}`,
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
        });
    }

    async checkIfFoodIsExits(FoodId) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM mon_an WHERE MA_MAMON = ?`;
            dbConnect.query(sql, [FoodId], (err, result) => {
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

    }

    async updateFood(FoodId, FoodName, FoodType, FoodDescription) {
        return new Promise((resolve, reject) => {
            let sql = `call CAP_NHAT_MON_AN(?,?,?,?)`;
            dbConnect.query(sql, [FoodId, FoodName, FoodType, FoodDescription], (err, result) => {
                if (err)
                    return reject(err)
                resolve(true)
            })
        })
    }



    async updateFoodDetail(FoodId, FoodPrice, FoodRation) {
        return new Promise((resolve, reject) => {
            let sql = `call THEM_CHI_TIET_MON_AN(?,?,?)`;
            dbConnect.query(sql, [FoodId, FoodPrice, FoodRation], (err, result) => {
                if (err)
                    return reject(err)
                resolve(true)
            })
        })
    }

    async deleteFoodImage(FoodId, FoodImageUrl) {
        return new Promise((resolve, reject) => {
            let sql = `DELETE FROM anh_mon_an WHERE MA_MAMON = ? AND AMA_URL = ?`;
            dbConnect.query(sql, [FoodId, FoodImageUrl], (err, result) => {
                if (err)
                    return reject(err)
                resolve(true)
            })
        })
    }

    async deleteAllFoodDetail(FoodId) {
        return new Promise((resolve, reject) => {
            let sql = `delete from chi_tiet_mon_an  where MA_MAMON = ?`;
            dbConnect.query(sql, [FoodId], (err, result) => {
                if (err)
                    return reject(err)
                resolve(true)
            })
        })
    }

    async deleteAllFoodImage(FoodId) {
        return new Promise((resolve, reject) => {
            let sql = `DELETE FROM anh_mon_an WHERE MA_MAMON = ?`;
            dbConnect.query(sql, [FoodId], (err, result) => {
                if (err)
                    return reject(err)
                resolve(true)
            })
        })
    }

    async deleteAllFoodComment(FoodId){
        return new Promise((resolve, reject) => {
            let sql = `call XOA_BINH_LUAN_CUA_MON_AN(?)`;
            dbConnect.query(sql, [FoodId], (err, result) => {
                if (err)
                    return reject(err)
                resolve(true)
            })
        })
    }

    async updateFoodImage(FoodId, FoodImageUrl, FoodImageDescription) {
        return new Promise((resolve, reject) => {
            let sql = `call THEM_ANH_MON_AN(?,?,?)`;
            dbConnect.query(sql, [FoodId, FoodImageUrl, FoodImageDescription], (err, result) => {
                if (err)
                    return reject(err)
                resolve(true)
            })
        })
    }

    async addFood(FoodType, FoodName, FoodDescription) {
        return new Promise((resolve, reject) => {
            let sql = `call THEM_MON_AN(?,?,?,@FoodId)`;
            dbConnect.query(sql, [FoodType, FoodName, FoodDescription], (err, result) => {
                if (err)
                    return reject(err)
                resolve(result)
            })
        })
    }

    async deleteFood(FoodId) {
        return new Promise((resolve, reject) => {
            let sql = `DELETE FROM mon_an WHERE MA_MAMON = ?`;
            dbConnect.query(sql, [FoodId], (err, result) => {
                if (err)
                    return reject(err)
                resolve(true)
            })
        })
    }

    checkIfFoodIsInAnyOrder(FoodId){

    }
}

module.exports = Food;