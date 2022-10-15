const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const Cart = require('../database/Cart')
const verifyToken = require('../authentication/auth')
router.post('/add-to-cart', verifyToken, async (req, res) => {
    const { mactma, count } = req.body
    const authHeader = req.header('Authorization')
    const token = authHeader
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
    if (count > 0)
        try {
            await new Cart()
                .addToCart(
                    customerid,
                    mactma,
                    count
                )
                .then((result) => {
                    if (result)
                        return res.status(200).json({
                            success: true,
                            message: 'Thêm món ăn vào giỏ thành công'
                        });
                    else
                        return res.status(400).json({
                            success: false,
                            message: 'Món ăn không tồn tại'
                        });
                })
                .catch((err) => setImmediate(() => {
                    console.log(err)
                    return res.status(400).json({
                        success: false,
                        message: 'Món ăn không tồn tại'
                    });
                }))
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Quý khách vui lòng thử lại sau'
            });
        }
    else
        return res.status(400).json({
            success: false,
            message: 'Số lượng món ăn phải lớn hơn 0'
        });
})

router.post('/update-cart', verifyToken, async (req, res) => {
    const { mactma, count } = req.body
    const authHeader = req.header('Authorization')
    const token = authHeader
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
    if (count > 0)
        try {
            await new Cart()
                .updateCart(
                    customerid,
                    mactma,
                    count
                )
                .then((result) => {
                    if (result)
                        return res.status(200).json({
                            success: true,
                            message: 'Cập nhật giỏ thành công'
                        });
                    else
                        return res.status(400).json({
                            success: false,
                            message: 'Món ăn không tồn tại'
                        });
                })
                .catch((err) => setImmediate(() => {
                    console.log(err)
                    return res.status(400).json({
                        success: false,
                        message: 'Món ăn không tồn tại'
                    });
                }))
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Quý khách vui lòng thử lại sau'
            });
        }
    else
        return res.status(400).json({
            success: false,
            message: 'Số lượng món ăn phải lớn hơn 0'
        });
})

router.get('/get-cart-detail', verifyToken, async (req, res) => {
    const authHeader = req.header('Authorization')
    const token = authHeader
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
    try {
        await new Cart()
            .getCartDetail(
                customerid
            )
            .then((cartDetails) => {
                if (cartDetails.length > 0)
                    return res.status(200).json({
                        success: true,
                        cart_detail: cartDetails
                    });
                else
                    return res.status(400).json({
                        success: false,
                        message: 'Món ăn không tồn tại'
                    });
            })
            .catch((err) => setImmediate(() => {
                console.log(err)
                return res.status(400).json({
                    success: false,
                    message: 'Món ăn không tồn tại'
                });
            }))
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: 'Quý khách vui lòng thử lại sau'
        });
    }
})

router.delete('/delete-cart-detail', verifyToken, async (req, res) => {
    const { mactma } = req.body
    const authHeader = req.header('Authorization')
    const token = authHeader
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
    try {
        await new Cart()
            .deleteFromCart(
                customerid,
                mactma
            )
            .then((result) => {
                if (result)
                    return res.status(200).json({
                        success: true,
                        message: 'Xóa món ăn thành công'
                    });
                else
                    return res.status(400).json({
                        success: false,
                        message: 'Món ăn không tồn trong giỏ'
                    });
            })
            .catch((err) => setImmediate(() => {
                console.log(err)
                return res.status(400).json({
                    success: false,
                    message: 'Món ăn không tồn tại'
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