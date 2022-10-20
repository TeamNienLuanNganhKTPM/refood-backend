const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const Cart = require('../database/Cart')
const Address = require('../database/Address')
const verifyToken = require('../authentication/auth')
const { checkText, checkPaymentMethod } = require('../function/Inspect');
const Order = require('../database/Order');
router.post('/create-food-order', verifyToken, async (req, res) => {
    const { addressid, ordernote, paymentmethod } = req.body
    //paymentmethod momo || cod
    const decoded = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
    if (!checkText(ordernote))
        return res.status(400).json({
            success: false,
            message: 'Nội dung ghi chú đơn không phù hợp'
        })
    if (!checkPaymentMethod(paymentmethod))
        return res.status(400).json({
            success: false,
            message: 'Quý Khách vui lòng chọn phương thức thanh toán hợp lệ'
        })
    await new Address().verifyAccountAddress(customerid, addressid)
        .then(async (result) => {
            if (!result)
                return res.status(400).json({
                    success: false,
                    message: 'Quý Khách vui lòng nhập địa phù hợp để đặt đơn'
                })
            else {
                await new Cart().getCartDetail(customerid)
                    .then(async (result) => {
                        if (result.length <= 0)
                            return res.status(400).json({
                                success: false,
                                message: 'Quý Khách chưa chọn món ăn nào để vào giỏ món'
                            })
                        else {
                            await new Cart().getCartSubTotal(customerid)
                                .then(async (result) => {
                                    if (result > 0)
                                        await new Order().create(customerid, addressid, ordernote, result, paymentmethod)
                                            .then((result) => {
                                                console.log(result)
                                                return res.status(200).json({
                                                    success: true,
                                                    message: 'Đơn của Quý Khách đã được tạo',
                                                    order_info: result
                                                })

                                            })
                                    else
                                        return res.status(400).json({
                                            success: false,
                                            message: 'Quý Khách chưa chọn món ăn nào để vào giỏ món'
                                        })
                                })
                        }
                    })
            }
        })
})

router.put('/update-food-order', verifyToken, async (req, res) => {
    const { addressid, ordernote, paymentmethod } = req.body
    //paymentmethod momo || cod
    const decoded = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
    if (!checkText(ordernote))
        return res.status(400).json({
            success: false,
            message: 'Nội dung ghi chú đơn không phù hợp'
        })
    if (!checkPaymentMethod(paymentmethod))
        return res.status(400).json({
            success: false,
            message: 'Quý Khách vui lòng chọn phương thức thanh toán hợp lệ'
        })
    await new Address().verifyAccountAddress(customerid, addressid)
        .then(async (result) => {
            if (!result)
                return res.status(400).json({
                    success: false,
                    message: 'Quý Khách vui lòng nhập địa phù hợp để đặt đơn'
                })
            else {
                await new Cart().getCartDetail(customerid)
                    .then(async (result) => {
                        if (result.length <= 0)
                            return res.status(400).json({
                                success: false,
                                message: 'Quý Khách chưa chọn món ăn nào để vào giỏ món'
                            })
                        else {
                            await new Cart().getCartSubTotal(customerid)
                                .then(async (result) => {
                                    if (result > 0)
                                        await new Order().create(customerid, addressid, ordernote, result, paymentmethod)
                                            .then((result) => {
                                                console.log(result)
                                                return res.status(200).json({
                                                    success: true,
                                                    message: 'Đơn của Quý Khách đã được tạo',
                                                    order_info: result
                                                })

                                            })
                                    else
                                        return res.status(400).json({
                                            success: false,
                                            message: 'Quý Khách chưa chọn món ăn nào để vào giỏ món'
                                        })
                                })
                        }
                    })
            }
        })
})
module.exports = router