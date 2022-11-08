const express = require('express')
const router = express.Router();
const verifyAdmin = require('../authentication/auth')
const Food = require('../database/Food')
const FoodType = require('../database/FoodType')
const { uploadImage } = require('../function/driveAPI')
const { checkText, checkFoodImage } = require('../function/Inspect')

router.get('/get-foods/:pageCur/:numOnPage', async (req, res) => {
    await new Food()
        .getAll()
        .then((foods) => {
            let numberToGet = req.params.numOnPage //số lượng món ăn trên 1 trang
            let pageNum = Math.ceil(foods.length / numberToGet);
            const pageCur = (req.params.pageCur > pageNum) ? pageNum : (req.params.pageCur < 1) ? 1 : req.params.pageCur
            let foodss = []
            let curIndex = (pageCur - 1) * numberToGet
            let count = 0
            while (foods[curIndex] != null && count < numberToGet) {
                foodss.push(foods[curIndex])
                curIndex++
                count++
            }
            return res.status(200).json({
                success: true,
                countOnPage: foodss.length,
                pageCur,
                pageNum,
                foods: foodss,
            });
        })
        .catch((err) => setImmediate(() => {
            return res.status(400).json({
                success: false,
                message: 'Quý khách vui lòng thử lại sau'
            });
        }))
})

router.get('/food-detail/:foodKey', verifyAdmin, async (req, res) => {
    const foodKey = req.params.foodKey
    console.log(foodKey)
    if (foodKey != null)
        await new Food()
            .getDetailsSlug(foodKey)
            .then(async (food) => {
                if (food.length > 0) {
                    return res.status(200).json({
                        success: true,
                        food_info: food[0]
                    });
                }
                else {
                    await new Food()
                        .getDetails(foodKey)
                        .then((food) => {
                            return res.status(200).json({
                                success: true,
                                food_info: food[0]
                            });
                        })
                        .catch((err) => setImmediate(() => {
                            return res.status(400).json({
                                success: false,
                                message: 'Vui lòng thử lại sau'
                            });
                        }))
                }
            })
            .catch((err) => setImmediate(() => {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng thử lại sau'
                });
            }))
    else
        return res.status(400).json({
            success: false,
            message: 'Không có mã món ăn để tìm'
        });
})

router.put('/food-edit', verifyAdmin, async (req, res) => {
    //https://drive.google.com/uc?id=
    let { foodid, foodname, foodtype, foodpriceration, fooddescription, foodimagedeleted, foodpricerationdeleted } = req.body
    //Chuyển các dữ liệu sang array hết
    // Chi tiết món ăn
    if (!Array.isArray(foodpriceration)) {
        if (foodpriceration != undefined) {
            let tempFoodPriceRation = foodpriceration
            foodpriceration = []
            foodpriceration.push(tempFoodPriceRation)
        } else foodpriceration = []
    }
    //Ảnh
    let foodimage = []
    if (req.files != null && !Array.isArray(req.files.foodimage)) {
        foodimage.push(req.files.foodimage)
    } else if (req.files != null) {
        foodimage = req.files.foodimage
    }
    //Ảnh xóa
    if (!Array.isArray(foodimagedeleted)) {
        if (foodimagedeleted != undefined) {
            let tempFoodimagedeleted = foodimagedeleted
            foodimagedeleted = []
            foodimagedeleted.push(tempFoodimagedeleted)
        } else foodimagedeleted = []
    }
    //Chi tiết xóa
    if (!Array.isArray(foodpricerationdeleted)) {
        let tempFoodpricerationdeleted = foodpricerationdeleted
        foodpricerationdeleted = []
        foodpricerationdeleted.push(tempFoodpricerationdeleted)
    }

    //Kiểm tra xem có phải xóa toàn bộ hình ảnh món ăn hay không
    let isDeleteAllFoodImage = false
    await new Food().checkIfDeleteAllImage(foodid, foodimagedeleted)
        .then((result) => isDeleteAllFoodImage = result)
    //Kiểm tra xem có phải xóa toàn bộ chi tiết món ăn hay không
    let isDeleteAllFoodDetail = false
    await new Food().checkIfDeleteAllDetail(foodid, foodpricerationdeleted)
        .then((result) => isDeleteAllFoodDetail = result)
    //Kiểm tra món ăn có tồn tại hay không    
    let isExistFood = false
    await new Food().checkIfFoodIsExits(foodid)
        .then((result) => {
            isExistFood = result
        })

    if (req.files == null && isDeleteAllFoodImage) {
        return res.status(400).json({
            success: false,
            message: 'Chưa chọn ảnh món ăn'
        });
    } else if (req.files != null && !checkFoodImage(foodimage))
        return res.status(400).json({
            success: false,
            message: 'Ảnh món ăn không phù hợp, chỉ hỗ trợ định dạng png, jpeg, jpg'
        });
    else {
        if (isExistFood) {
            if (checkText(foodname)) {
                if (checkText(fooddescription)) {
                    await new Food().updateFood(foodid, foodname, foodtype, fooddescription)
                        .then(async (result) => {
                            //Cập nhật chi tiết khẩu phần món
                            let cantDeleteRationID = []
                            if (!isDeleteAllFoodDetail || foodpriceration.length > 0) {
                                foodpricerationdeleted.forEach(async e => {
                                    if (e != undefined)
                                        await new Food().checkIfFoodDetailIsInAnyOrder(e.replace('"', '').replace('"', ''))
                                            .then(async (result) => {
                                                if (!result)
                                                    await new Food().deleteAllFoodDetail(e.replace('"', '').replace('"', ''))
                                                else
                                                    cantDeleteRationID.push(e.replace('"', '').replace('"', ''))
                                            })
                                })
                                foodpriceration.forEach(async e => {
                                    let foodpriceratione = JSON.parse(e)
                                    console.log(foodpriceratione)
                                    if (e.id == null)
                                        await new Food().updateFoodDetail(foodid, foodpriceratione.price, foodpriceratione.ration)
                                    else 
                                        await new Food().updateFoodDetailExisted(foodid, foodpriceratione.id, foodpriceratione.price, foodpriceratione.ration)
                                })

                                //Cập nhật hình ảnh món
                                foodimagedeleted.forEach(async e => {
                                    if (e != undefined) {
                                        await new Food().deleteFoodImage(foodid, e.replace('"', '').replace('"', ''))
                                            .catch(err => console.log(err))
                                    }
                                })
                                foodimage.forEach(async (image, index) => {
                                    let id
                                    await uploadImage(image)
                                        .then(async (imageID) => {
                                            id = imageID
                                            await new Food().updateFoodImage(foodid, id, foodname)
                                        })
                                })
                                if (cantDeleteRationID.length > 0)
                                    return res.status(400).json({
                                        success: false,
                                        message: 'Có chi tiết món không thể xóa do đã được khách hàng đặt'
                                    });
                                else
                                    return res.status(200).json({
                                        success: true,
                                        message: 'Cập nhật món ăn thành công, vui lòng đợi giây lát khi ảnh đang được tải lên'
                                    });

                            } else {
                                return res.status(400).json({
                                    success: false,
                                    message: 'Chưa nhập chi tiết giá và khẩu phần món ăn'
                                });
                            }


                        })
                    // .catch((err) => {
                    //     console.log(err)
                    //     return res.status(400).json({
                    //         success: false,
                    //         message: 'Tên món ăn đã trùng'
                    //     });
                    // })

                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Mô tả của món ăn không hợp lệ'
                    });
                }
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Tên món ăn không hợp lệ'
                });
            }

        } else
            return res.status(400).json({
                success: false,
                message: 'Món ăn không tồn tại'
            });
    }
})

router.post('/food-add', verifyAdmin, async (req, res) => {
    let { foodname, foodtype, foodpriceration, fooddescription } = req.body
    if (!Array.isArray(foodpriceration)) {
        let tempFoodPriceRation = foodpriceration
        foodpriceration = []
        foodpriceration.push(tempFoodPriceRation)
    }
    if (foodpriceration.length > 0 && Array.isArray(foodpriceration)) {
        let foodid
        if (req.files == null) {
            return res.status(400).json({
                success: false,
                message: 'Chưa chọn ảnh món ăn'
            });
        } else if (!checkFoodImage(req.files.foodimage))
            return res.status(400).json({
                success: false,
                message: 'Ảnh món ăn không phù hợp, chỉ hỗ trợ định dạng png, jpeg, jpg'
            });
        else if (checkText(foodname)) {
            try {
                await new Food().addFood(foodtype.split('LMA')[1], foodname, fooddescription)
                    .then((result) => {
                        foodid = result[0][0]['@FoodId']
                    })
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên món đã trùng hoặc loại món không phù hợp'
                });
            }
            if (Array.isArray(foodpriceration)) {
                foodpriceration.forEach(async e => {
                    let tempFoodpriceration = JSON.parse(e)
                    try {
                        await new Food().updateFoodDetail(foodid, tempFoodpriceration.price, tempFoodpriceration.ration)
                    }
                    catch (err) {
                        return res.status(400).json({
                            success: false,
                            message: 'Có lỗi xảy ra khi thêm chi tiết khẩu phần món ăn'
                        });
                    }
                })
            } else if (foodpriceration) {
                try {
                    await new Food().updateFoodDetail(foodid, foodpriceration.price, foodpriceration.ration)
                }
                catch (err) {
                    return res.status(400).json({
                        success: false,
                        message: 'Có lỗi xảy ra khi thêm chi tiết khẩu phần món ăn'
                    });
                }
            }
            //thêm hình ảnh món
            try {
                if (Array.isArray(req.files.foodimage)) {
                    req.files.foodimage.forEach(async (image, index) => {
                        let id
                        await uploadImage(image)
                            .then(async (imageID) => {
                                id = imageID
                                await new Food().updateFoodImage(foodid, id, foodname)
                            })
                    })
                    return res.status(200).json({
                        success: true,
                        message: 'Tạo món ăn thành công, vui lòng đợi giây lát khi ảnh đang được tải lên'
                    });
                } else if (req.files.foodimage) {
                    let id
                    await uploadImage(req.files.foodimage)
                        .then(async (imageID) => {
                            id = imageID
                            await new Food().updateFoodImage(foodid, id, foodname)
                        })
                    return res.status(200).json({
                        success: true,
                        message: 'Tạo món ăn thành công, vui lòng đợi giây lát khi ảnh đang được tải lên'
                    });
                }
                else {
                    return res.status(200).json({
                        success: true,
                        message: 'Thiếu hình ảnh món ăn'
                    });
                }
            } catch (err) {
                console.log(err)
                return res.status(400).json({
                    success: false,
                    message: 'Có lỗi xảy ra khi tải lên hình ảnh món ăn'
                });
            }

        } else {
            return res.status(400).json({
                success: false,
                message: 'Tên món ăn không hợp lệ'
            });
        }
    } else {
        return res.status(400).json({
            success: false,
            message: 'Chưa có chi tiết giá và khẩu phần món ăn'
        });
    }
})

router.delete('/food-delete', verifyAdmin, async (req, res) => {
    const { foodid } = req.body
    let isExistFood
    await new Food().checkIfFoodIsExits(foodid)
        .then((result) => {
            isExistFood = result
        })
    if (isExistFood) {
        await new Food().checkIfFoodIsInAnyOrder(foodid)
            .then(async (result) => {
                if (!result) {
                    await new Food().deleteAllFoodDetailOfFood(foodid)
                    await new Food().deleteAllFoodImage(foodid)
                    await new Food().deleteAllFoodComment(foodid)
                    await new Food().deleteAllFoodReview(foodid)
                    await new Food().deleteFood(foodid)
                    return res.status(200).json({
                        success: true,
                        message: 'Xóa món ăn thành công'
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Món ăn đang tồn tại trong đơn hàng hoặc giỏ món ăn của khách hàng, không thể xóa'
                    });
                }
            })
    } else
        return res.status(400).json({
            success: false,
            message: 'Món ăn không tồn tại'
        });
})

router.post('/food-type-add', verifyAdmin, async (req, res) => {
    const { foodtypename, foodtypedescription } = req.body;
    if (!checkText(foodtypename))
        return res.status(400).json({ success: false, message: 'Tên loại món ăn không hợp lệ' })
    else if (!checkText(foodtypedescription))
        return res.status(400).json({ success: false, message: 'Mô tả loại món ăn không hợp lệ' })
    else
        try {
            let foundedFoodType
            await new FoodType()
                .find(foodtypename)
                .then((foodtype) => {
                    foundedFoodType = foodtype
                })
                .catch((err) => setImmediate(() => { throw err; }))
            if (foundedFoodType.FoodTypeId == undefined) {
                await new FoodType()
                    .create(foodtypename, foodtypedescription)
                    .then((foodtype) => {
                        return res.status(200).json({
                            success: true, message: 'Thêm loại món ăn thành công',
                            foodtype_info: foodtype
                        });
                    })
                    .catch((err) => setImmediate(() => { throw err; }))

            } else
                return res.status(400).json({ success: false, message: 'Tên loại món ăn bị trùng' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Vui lòng thử lại sau' })
        }

})

router.put('/food-type-edit', verifyAdmin, async (req, res) => {
    const { foodtypeid, foodtypename, foodtypedescription } = req.body;
    if (!checkText(foodtypename))
        return res.status(400).json({ success: false, message: 'Tên loại món ăn không hợp lệ' })
    else if (!checkText(foodtypedescription))
        return res.status(400).json({ success: false, message: 'Mô tả loại món ăn không hợp lệ' })
    else
        try {
            let foundedFoodType
            await new FoodType()
                .findByID(foodtypeid)
                .then((foodtype) => {
                    foundedFoodType = foodtype
                })
            let foundedFoodTypeByName
            await new FoodType()
                .findByName(foodtypename)
                .then((foodtype) => {
                    foundedFoodTypeByName = foodtype
                })
                .catch((err) => setImmediate(() => { throw err; }))
            if (foundedFoodType.FoodTypeId == undefined) {
                return res.status(400).json({ success: false, message: 'Loại món ăn không tồn tại' });
            } else if (foundedFoodTypeByName.FoodTypeName == foodtypename && foundedFoodTypeByName.FoodTypeId != foundedFoodType.FoodTypeId)
                return res.status(400).json({ success: false, message: 'Tên loại món đã trùng' });
            else {
                await new FoodType()
                    .update(foodtypeid, foodtypename, foodtypedescription)
                    .then((result) => {
                        if (result)
                            return res.status(200).json({
                                success: true,
                                message: 'Cập nhật loại món ăn thành công'
                            });
                    })
                    .catch((err) => setImmediate(() => { throw err; }))
            }
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Vui lòng thử lại sau' })
        }
})

router.get('/get-foodtypes/:pageCur/:numOnPage', verifyAdmin, async (req, res) => {
    await new FoodType()
        .getAll()
        .then((foodtypes) => {
            let numberToGet = req.params.numOnPage //số lượng món ăn trên 1 trang
            let pageNum = Math.ceil(foodtypes.length / numberToGet);
            const pageCur = (req.params.pageCur > pageNum) ? pageNum : (req.params.pageCur < 1) ? 1 : req.params.pageCur
            let foodtypess = []
            let curIndex = (pageCur - 1) * numberToGet
            let count = 0
            while (foodtypes[curIndex] != null && count < numberToGet) {
                foodtypess.push(foodtypes[curIndex])
                curIndex++
                count++
            }
            return res.status(200).json({
                success: true,
                countOnPage: foodtypess.length,
                pageCur,
                pageNum,
                foodtypes: foodtypess
            });
        })
        .catch((err) => setImmediate(() => {
            // throw err; 
            return res.status(400).json({
                success: false,
                message: 'Vui lòng thử lại sau'
            });
        }))
})

router.delete('/food-type-delete', verifyAdmin, async (req, res) => {
    const { foodtypeid } = req.body
    let isExistFoodtype
    await new FoodType().checkIfFoodtypeIsExits(foodtypeid)
        .then((result) => {
            isExistFoodtype = result
        })
    if (isExistFoodtype) {
        let isExistFood
        await new FoodType().checkIfExistFoodWithFoodtype(foodtypeid)
            .then((result) => {
                isExistFood = result
            })
        if (isExistFood)
            return res.status(400).json({
                success: false,
                message: 'Loại món ăn này đang chứa các món ăn khác!'
            });
        else {
            await new FoodType().deleteFoodType(foodtypeid)
                .then((result) => {
                    return res.status(200).json({
                        success: false,
                        message: 'Xóa loại món ăn thành công'
                    });
                })
        }
    } else
        return res.status(400).json({
            success: false,
            message: 'Loại món ăn không tồn tại'
        });
})
module.exports = router