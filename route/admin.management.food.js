const express = require('express')
const router = express.Router();
const verifyAdmin = require('../authentication/auth')
const Food = require('../database/Food')
const FoodType = require('../database/FoodType')
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
                        message: 'Tên món ăn đã trùng'
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

                    if (Array.isArray(req.files.foodimage)) {
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
                if (Array.isArray(req.files.foodimage)) {
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

router.get('/get-foodtypes', verifyAdmin, async (req, res) => {
    await new FoodType()
        .getAll()
        .then((foodtypes) => {
            return res.status(200).json({
                success: true,
                foodtypes
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