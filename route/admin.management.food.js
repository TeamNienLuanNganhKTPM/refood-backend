const express = require('express')
const router = express.Router();
const verifyAdmin = require('../authentication/auth')
const Food = require('../database/Food');
const { uploadImage } = require('../function/driveAPI')
const { checkText } = require('../function/Inspect')
router.get('/food-detail/:foodKey', verifyAdmin, async (req, res) => {
    const foodKey = req.params.foodKey
    console.log(foodKey)
    if (foodKey != null)
        await new Food()
            .getDetailsSlug(foodKey)
            .then(async (food) => {
                if (food.length > 0)
                    return res.status(200).json({
                        success: true,
                        food_info: food[0]
                    });
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
    const { foodid, foodname, foodtype, foodpriceration, fooddescription, foodimagedescription, foodimagedeleted, fooddetaildeleted } = req.body
    let isExistFood
    await new Food().checkIfFoodIsExits(foodid)
        .then((result) => {
            isExistFood = result
        })
    if (isExistFood) {
        if (checkText(foodname)) {
            if (checkText(fooddescription)) {
                try {
                    await new Food().updateFood(foodid, foodname, foodtype, fooddescription)
                } catch (err) {
                    return res.status(400).json({
                        success: false,
                        message: 'Có lỗi xảy ra khi cập nhật món ăn'
                    });
                }
                //Cập nhật chi tiết khẩu phần món
                if (Array.isArray(foodpriceration)) {
                    await new Food().deleteAllFoodDetail(foodid)

                    foodpriceration.forEach(async e => {
                        let foodpriceration = JSON.parse(e)
                        try {
                            await new Food().updateFoodDetail(foodid, foodpriceration.price, foodpriceration.ration)
                        }
                        catch (err) {
                            return res.status(400).json({
                                success: false,
                                message: 'Có lỗi xảy ra khi cập nhật chi tiết khẩu phần món ăn'
                            });
                        }
                    })
                } else if (foodpriceration) {
                    await new Food().deleteAllFoodDetail(foodid)
                    let foodpriceratione = JSON.parse(foodpriceration)
                    try {
                        await new Food().updateFoodDetail(foodid, foodpriceratione.price, foodpriceratione.ration)
                    }
                    catch (err) {
                        return res.status(400).json({
                            success: false,
                            message: 'Có lỗi xảy ra khi cập nhật chi tiết khẩu phần món ăn'
                        });
                    }
                }
                //Cập nhật hình ảnh món
                try {
                    if (Array.isArray(foodimagedeleted)) {
                        foodimagedeleted.forEach(async e => {
                            await new Food().deleteFoodImage(foodid, e)
                        })
                    } else if (foodimagedeleted) {
                        await new Food().deleteFoodImage(foodid, foodimagedeleted)
                    }

                    if (Array.isArray(req.files.foodimage.length)) {
                        req.files.foodimage.forEach(async (image, index) => {
                            let id
                            await uploadImage(image)
                                .then(async (imageID) => {
                                    id = imageID
                                    await new Food().updateFoodImage(foodid, id, foodimagedescription[index])
                                })
                        })
                        return res.status(200).json({
                            success: true,
                            message: 'Cập nhật món ăn thành công, vui lòng đợi giây lát khi ảnh đang được tải lên'
                        });
                    } else if (req.files.foodimage.length) {
                        let id
                        await uploadImage(req.files.foodimage)
                            .then(async (imageID) => {
                                id = imageID
                                await new Food().updateFoodImage(foodid, id, foodimagedescription[index])
                            })
                        return res.status(200).json({
                            success: true,
                            message: 'Cập nhật món ăn thành công, vui lòng đợi giây lát khi ảnh đang được tải lên'
                        });
                    } else {
                        return res.status(200).json({
                            success: true,
                            message: 'Cập nhật món ăn thành công'
                        });
                    }
                } catch (err) {
                    console.log(err)
                    return res.status(400).json({
                        success: false,
                        message: 'Có lỗi xảy ra khi cập nhật hình ảnh món ăn'
                    });
                }
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

})

router.post('/food-add', verifyAdmin, async (req, res) => {
    const { foodname, foodtype, foodpriceration, fooddescription, foodimagedescription } = req.body
    let foodid
    if (checkText(foodname)) {
        if (checkText(fooddescription)) {
            try {
                await new Food().addFood(foodtype.split('LMA')[1], foodname, fooddescription)
                    .then((result) => {
                        foodid = result[0][0]['@FoodId']
                    })
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên món đã trùng'
                });
            }
            if (Array.isArray(foodpriceration)) {
                foodpriceration.forEach(async e => {
                    let foodpriceration = JSON.parse(e)
                    try {
                        await new Food().updateFoodDetail(foodid, foodpriceration.price, foodpriceration.ration)
                    }
                    catch (err) {
                        return res.status(400).json({
                            success: false,
                            message: 'Có lỗi xảy ra khi thêm chi tiết khẩu phần món ăn'
                        });
                    }
                })
            } else if (foodpriceration) {
                let foodpriceratione = JSON.parse(foodpriceration)
                try {
                    await new Food().updateFoodDetail(foodid, foodpriceratione.price, foodpriceratione.ration)
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
                if (Array.isArray(req.files.foodimage.length)) {
                    foodimage.forEach(async (image, index) => {
                        let id
                        await uploadImage(image)
                            .then(async (imageID) => {
                                id = imageID
                                await new Food().updateFoodImage(foodid, id, foodimagedescription[index])
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
                            await new Food().updateFoodImage(foodid, id, foodimagedescription)
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
                message: 'Mô tả của món ăn không hợp lệ'
            });
        }
    } else {
        return res.status(400).json({
            success: false,
            message: 'Tên món ăn không hợp lệ'
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
        await new Food().deleteAllFoodDetail(foodid)
        await new Food().deleteAllFoodImage(foodid)
        await new Food().deleteFood(foodid)
        return res.status(200).json({
            success: false,
            message: 'Xóa món ăn thành công'
        });
    } else
        return res.status(400).json({
            success: false,
            message: 'Món ăn không tồn tại'
        });
})
module.exports = router