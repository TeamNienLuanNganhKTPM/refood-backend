const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const FoodType = require('../database/FoodType')
const Food = require('../database/Food')
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
                message: 'Please try again'
            });
        }))
})

router.get('/get-foods', async (req, res) => {
    await new Food()
        .getAll()
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
                message: 'Please try again'
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
                    message: 'Please try again'
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
                    message: 'Please try again'
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
                    message: 'Please try again'
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
                    message: 'Please try again'
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
                    message: 'Please try again'
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
        let minPrice = (prices!=undefined)?prices.split('-')[0]:undefined;
        let maxPrice = (prices!=undefined)?prices.split('-')[1]:undefined;
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
                    message: 'Please try again'
                });
            }))
    }
})
module.exports = router