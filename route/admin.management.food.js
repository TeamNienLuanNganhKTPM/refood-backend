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
                    console.log(food)
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
    const { foodid, foodname, foodtype, foodpriceration, fooddescription, foodimagedeleted, foodpricerationdeleted } = req.body
    let isExistFood
    await new Food().checkIfFoodIsExits(foodid)
        .then((result) => {
            isExistFood = result
        })
    if (isExistFood) {
        if (!checkFoodImage(req.files.foodimage)) {
            return res.status(400).json({
                success: false,
                message: 'Ảnh món ăn không phù hợp, chỉ hỗ trợ định dạng png, jpeg, jpg'
            });
        }
        else
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
                                        await new Food().updateFoodImage(foodid, id, foodname)
                                    })
                            })
                            return res.status(200).json({
                                success: true,
                                message: 'Cập nhật món ăn thành công, vui lòng đợi giây lát khi ảnh đang được tải lên'
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
    let { foodname, foodtype, foodpriceration, fooddescription } = req.body
    // if(!Array.isArray(foodpriceration)){
        // foodpriceration = JSON.parse(foodpriceration)
    // }
    // console.log(req.files.foodimage)
    let foodid
    if (!checkFoodImage(req.files.foodimage)) {
        return res.status(400).json({
            success: false,
            message: 'Ảnh món ăn không phù hợp, chỉ hỗ trợ định dạng png, jpeg, jpg'
        });
    }
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
                try {
                    await new Food().updateFoodDetail(foodid, e.price, e.ration)
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
            .then(async (result) => {
                await new Food().deleteAllFoodImage(foodid)
                await new Food().deleteAllFoodComment(foodid)
                await new Food().deleteFood(foodid)
                return res.status(200).json({
                    success: true,
                    message: 'Xóa món ăn thành công'
                });
            })
            .catch((err)=>{
                return res.status(400).json({
                    success: false,
                    message: 'Món ăn đang tồn tại trong đơn hàng, không thể xóa'
                });
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