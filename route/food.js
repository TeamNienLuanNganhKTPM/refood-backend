const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const FoodType = require('../database/FoodType')
const Food = require('../database/Food')
const Comment = require('../database/Comment')
const Cart = require('../database/Cart')
const verifyToken = require('../authentication/auth')
const intersectMany = require('../function/arrayFunction')
router.post('/add-food-type', async (req, res) => {
    const { foodtypename, foodtypedescription } = req.body;
    if (!foodtypename)
        return res.status(400).json({ success: false, message: 'Food type name is missing' })
    else if (!foodtypename.match(/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u) == null)
        return res.status(400).json({ success: false, message: 'Foodtype name is not valid!' })
    else if (!foodtypedescription.match(/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u) == null)
        return res.status(400).json({ success: false, message: 'Foodtype description is not valid!' })
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
                console.log(foundedFoodType)
                let newAddedFoodType
                await new FoodType()
                    .create(foodtypename, foodtypedescription)
                    .then((foodtype) => {
                        newAddedFoodType = foodtype
                    })
                    .catch((err) => setImmediate(() => { throw err; }))
                console.log(newAddedFoodType)
                return res.status(200).json({
                    success: true, message: 'Foodtype is added successfully',
                    foodtype_info: {
                        FoodTypeId: newAddedFoodType.FoodTypeId,
                        FoodTypeName: newAddedFoodType.FoodTypeName,
                        FoodTypeDescription: newAddedFoodType.FoodTypeDescription
                    }
                });
            } else
                return res.status(400).json({ success: false, message: 'Foodtype name is dupplicated' });
        } catch (err) {
            console.log(err)
            return res.status(500).json({ success: false, message: 'Internal server error' })
        }

})

router.get('/get-foodtypes', async (req, res) => {
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
                message: 'Quý khách vui lòng thử lại sau'
            });
        }))
})

router.get('/get-foods', async (req, res) => {
    await new Food()
        .getAll()
        .then((foods) => {
            return res.status(200).json({
                success: true,
                countAll: foods.length,
                foods
            });
        })
        .catch((err) => setImmediate(() => {
            // throw err; 
            return res.status(400).json({
                success: false,
                message: 'Quý khách vui lòng thử lại sau'
            });
        }))
})

router.get('/get-foods/:pageCur', async (req, res) => {
    await new Food()
        .getAll()
        .then((foods) => {
            let numberToGet = 9 //số lượng món ăn trên 1 trang
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

router.get('/find-foods', async (req, res) => {
    let foods = [];
    let { name, type, prices, ration, review } = req.query
    let foodByName = [];
    let foodByType = [];
    let foodByPrices = [];
    let foodByRation = [];
    let foodByReview = [];
    if (name != undefined) {
        await new Food()
            .findByFoodName(name)
            .then((foundedFoods) => {
                if (foundedFoods.length > 0)
                    foodByName = foodByName.concat(foundedFoods)
            })
            .catch((err) => setImmediate(() => {
                return res.status(400).json({
                    success: false,
                    message: 'Quý khách vui lòng thử lại sau'
                });
            }))
    }
    if (type != undefined) {
        await new Food()
            .findByFoodType(type)
            .then((foundedFoods) => {
                if (foundedFoods.length > 0)
                    foodByType = foodByType.concat(foundedFoods)
            })
            .catch((err) => setImmediate(() => {
                return res.status(400).json({
                    success: false,
                    message: 'Quý khách vui lòng thử lại sau'
                });
            }))
    }
    if (prices != undefined) {
        let minPrice = prices.split('-')[0];
        let maxPrice = prices.split('-')[1];
        await new Food()
            .findByFoodPrice(minPrice, maxPrice)
            .then((foundedFoods) => {
                if (foundedFoods.length > 0)
                    foodByPrices = foodByPrices.concat(foundedFoods)
            })
            .catch((err) => setImmediate(() => {
                return res.status(400).json({
                    success: false,
                    message: 'Quý khách vui lòng thử lại sau'
                });
            }))
    }
    if (ration != undefined) {
        await new Food()
            .findByFoodRation(ration)
            .then((foundedFoods) => {
                if (foundedFoods.length > 0)
                    foodByRation = foodByRation.concat(foundedFoods)
            })
            .catch((err) => setImmediate(() => {
                return res.status(400).json({
                    success: false,
                    message: 'Quý khách vui lòng thử lại sau'
                });
            }))
    }
    if (review != undefined) {
        await new Food()
            .findByFoodReview(review)
            .then((foundedFoods) => {
                if (foundedFoods.length > 0)
                    foodByReview = foodByReview.concat(foundedFoods)
            })
            .catch((err) => setImmediate(() => {
                console.log(err)
                return res.status(400).json({
                    success: false,
                    message: 'Quý khách vui lòng thử lại sau'
                });
            }))
    }

    foods = intersectMany(foodByName, foodByType, foodByPrices, foodByRation, foodByReview)
    foods = foods.concat(foodByName, foodByType, foodByPrices, foodByRation, foodByReview)
    // foods = [...new Map(foods.map((food) => [food.FoodId, food])).values()]; // remove dupplicated food
    return res.status(200).json({
        success: true,
        foodByName,
        foodByType,
        foodByPrices,
        foodByRation,
        foodByReview
    })
})

router.get('/filter-foods', async (req, res) => {
    let { name, type, prices, ration, review } = req.query
    if (name == undefined && type == undefined && prices == undefined && ration == undefined && review == undefined)
        return res.status(400).json({
            success: false,
            message: 'Can\'t fill with this query'
        });
    else {
        let minPrice = (prices != undefined) ? prices.split('-')[0] : undefined;
        let maxPrice = (prices != undefined) ? prices.split('-')[1] : undefined;
        await new Food()
            .filterFoods(name, type, minPrice, maxPrice, ration, review)
            .then((foods) => {
                return res.status(200).json({
                    success: true,
                    foods
                });
            })
            .catch((err) => setImmediate(() => {
                // throw err; 
                return res.status(400).json({
                    success: false,
                    message: 'Quý khách vui lòng thử lại sau'
                });
            }))
    }
})

router.get('/get-food-details/:foodKey', async (req, res) => {
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
                                message: 'Quý khách vui lòng thử lại sau'
                            });
                        }))
                }
            })
            .catch((err) => setImmediate(() => {
                return res.status(400).json({
                    success: false,
                    message: 'Quý khách vui lòng thử lại sau'
                });
            }))
    else
        return res.status(400).json({
            success: false,
            message: 'Không có mã món ăn để tìm'
        });
})

// router.get('/get-food-comments/:foodid', async (req, res) => {
//     const foodid = req.params.foodid
//     if (foodid != null)
//         await new Comment()
//             .getCommentByFoodId(foodid)
//             .then((comments) => {
//                 return res.status(200).json({
//                     success: true,
//                     comments
//                 });
//             })
//             .catch((err) => setImmediate(() => {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Quý khách vui lòng thử lại sau'
//                 });
//             }))
//     else
//         return res.status(400).json({
//             success: false,
//             message: 'Không có mã món ăn để tìm'
//         });
// })

router.get('/get-food-comments/:foodid', async (req, res) => {
    const foodid = req.params.foodid
    if (foodid != null)
        await new Comment()
            .getCommentByFoodId(foodid)
            .then((comments) => {
                const limit = req.query.limit
                let commentss = []
                let curIndex = 0
                let count = 0
                while (comments[curIndex] != null && count < limit) {
                    commentss.push(comments[curIndex])
                    curIndex++
                    count++
                }
                return res.status(200).json({
                    success: true,
                    countOnPage: commentss.length,
                    countAll: comments.length,
                    comments: commentss
                });
            })
            .catch((err) => setImmediate(() => {
                return res.status(400).json({
                    success: false,
                    message: 'Quý khách vui lòng thử lại sau'
                });
            }))
    else
        return res.status(400).json({
            success: false,
            message: 'Không có mã món ăn để tìm'
        });
})

router.get('/get-food-comments/:foodid/:pageCur', async (req, res) => {
    const foodid = req.params.foodid
    if (foodid != null)
        await new Comment()
            .getCommentByFoodId(foodid)
            .then((comments) => {
                let numberToGet = 5 //số lượng comment trên 1 lần load
                let pageNum = Math.ceil(comments.length / numberToGet);
                const pageCur = (req.params.pageCur > pageNum) ? pageNum : (req.params.pageCur < 1) ? 1 : req.params.pageCur
                let commentss = []
                let curIndex = (pageCur - 1) * numberToGet
                let count = 0
                while (comments[curIndex] != null && count < numberToGet) {
                    commentss.push(comments[curIndex])
                    curIndex++
                    count++
                }
                return res.status(200).json({
                    success: true,
                    countOnPage: commentss.length,
                    pageCur,
                    pageNum,
                    comments: commentss
                });
            })
            .catch((err) => setImmediate(() => {
                return res.status(400).json({
                    success: false,
                    message: 'Quý khách vui lòng thử lại sau'
                });
            }))
    else
        return res.status(400).json({
            success: false,
            message: 'Không có mã món ăn để tìm'
        });
})

router.post('/add-comment', verifyToken, async (req, res) => {
    const { foodid, content } = req.body
    const authHeader = req.header('Authorization')
    const token = authHeader
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const customerid = req.header('CustomerId')
    if (customerid == decoded.CustomerId)
        if (content.match(/^[0-9a-zA-ZàáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ ,.'-]+$/u) == null)
            return res.status(400).json({ success: false, message: 'Bình luận có chứa ký tự không hợp lệ!' })
        else {
            try {
                await new Comment()
                    .addComment(foodid.split('MA')[1], customerid.split('KH')[1], content)
                    .then((result) => {
                        return res.status(200).json({
                            success: true,
                            message: 'Thêm bình luận thành công'
                        });
                    })
                    .catch((err) => setImmediate(() => {
                        return res.status(400).json({
                            success: false,
                            message: 'Quý khách vui lòng thử lại sau'
                        });
                    }))
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: 'Quý khách vui lòng thử lại sau'
                });
            }
        }
    else
        return res.status(400).json({
            success: false,
            message: 'Token không hợp lệ'
        });
})

// router.put('/edit-comment', verifyToken, async (req, res) => {
//     const { commentid, foodid, content } = req.body
//     const authHeader = req.header('Authorization')
//     const token = authHeader
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
//     const customerid = req.header('CustomerId')
//     if (customerid == decoded.CustomerId)
//         if (content.match(/^[0-9a-zA-ZàáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ ,.'-]+$/u) == null)
//             return res.status(400).json({ success: false, message: 'Bình luận có chứa ký tự không hợp lệ!' })
//         else {
//             try {
//                 await new Comment()
//                     .editComment(
//                         commentid,
//                         foodid,
//                         customerid,
//                         content)
//                     .then((result) => {
//                         if (result == 1)
//                             return res.status(200).json({
//                                 success: true,
//                                 message: 'Sửa bình luận thành công'
//                             });
//                         else
//                             return res.status(400).json({
//                                 success: false,
//                                 message: 'Bình luận không tồn tại'
//                             });
//                     })
//                     .catch((err) => setImmediate(() => {
//                         return res.status(400).json({
//                             success: false,
//                             message: 'Quý khách vui lòng thử lại sau'
//                         });
//                     }))
//             } catch (err) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Quý khách vui lòng thử lại sau'
//                 });
//             }
//         }
//     else
//         return res.status(400).json({
//             success: false,
//             message: 'Token không hợp lệ'
//         });
// })

router.delete('/delete-comment', verifyToken, async (req, res) => {
    const { commentid, foodid } = req.body
    const customerid = req.header('CustomerId')
    try {
        await new Comment()
            .deleteComment(
                commentid,
                foodid,
                customerid,
            )
            .then((result) => {
                if (result)
                    return res.status(200).json({
                        success: true,
                        message: 'Đã xóa bình luận'
                    });
                else
                    return res.status(400).json({
                        success: false,
                        message: 'Bình luận không tồn tại'
                    });
            })
            .catch((err) => setImmediate(() => {
                console.log(err)
                return res.status(400).json({
                    success: false,
                    message: 'Quý khách vui lòng thử lại sau'
                });
            }))
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: 'Quý khách vui lòng thử lại sau'
        });
    }
})

module.exports = router