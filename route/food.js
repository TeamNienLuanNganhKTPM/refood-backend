const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const FoodType = require('../database/FoodType')
const verifyToken = require('../authentication/auth')
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
module.exports = router