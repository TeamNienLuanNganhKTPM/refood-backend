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
                const sql = "select * from mon_an ma join loai_mon_an lma on ma.LMA_MALOAI = lma.LMA_MALOAI join chi_tiet_mon_an ctma on ma.MA_MAMON=ctma.MA_MAMON join anh_mon_an ama on ma.MA_MAMON=ama.MA_MAMON";
                dbConnect.query(sql, [], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0) {
                            // let foods = result.reduce((group, product) => {
                            //     const { MA_MAMON, LMA_MALOAI, MA_TENMON } = product;
                            //     group[MA_MAMON, LMA_MALOAI, MA_TENMON] = group[MA_MAMON, LMA_MALOAI, MA_TENMON] ?? [];
                            //     group[MA_MAMON, LMA_MALOAI, MA_TENMON].push(product);
                            //     return group;
                            // }, {});
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