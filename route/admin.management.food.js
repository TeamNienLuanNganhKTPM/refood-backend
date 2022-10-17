const express = require('express')
const router = express.Router();
const verifyAdmin = require('../authentication/auth')
const Food = require('../database/Food');
const { uploadImage } = require('../function/driveAPI')
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
    const { foodid, foodname, foodtype, foodpriceration, fooddescription, foodimagedeleted, fooddetaildeleted } = req.body
    console.log(foodpriceration)
    req.files.foodimage.forEach(async (image) => {
        let id
        await uploadImage(image)
            .then((imageID) => {
                id = imageID
            })
        console.log(`https://drive.google.com/uc?id=${id}`)
    })

})
module.exports = router