const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const Cart = require('../database/Cart')
const Address = require('../database/Address')
const verifyToken = require('../authentication/auth')
const { checkText, checkPaymentMethod } = require('../function/Inspect');
const Order = require('../database/Order');
const { VNPayURL, verifyHashcode } = require('../function/VNPayAPI')
router.post('/create-food-order', verifyToken, async (req, res) => {
    const { addressid, ordernote, paymentmethod } = req.body
    //paymentmethod vnpay || cod
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

router.put('/update-food-order/:orderid', verifyToken, async (req, res) => {
    const { addressid, ordernote, paymentmethod } = req.body
    const orderid = req.params.orderid
    //paymentmethod vnpay || cod
    const decoded = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
    await new Order().verifyOrderWithCustomer(customerid, orderid)
        .then(async (result) => {
            if (result) {
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
                            await new Order().checkIfOrderCouldBeUpdate(orderid)
                                .then(async (result) => {
                                    if (result) {
                                        await new Order().update(customerid, orderid, addressid, ordernote, paymentmethod)
                                            .then((result) => {
                                                console.log(result)
                                                return res.status(200).json({
                                                    success: true,
                                                    message: 'Đơn của Quý Khách đã được cập nhật thành công'
                                                })

                                            })
                                    } else {
                                        return res.status(400).json({
                                            success: false,
                                            message: 'Đơn đặt món này đã được tiếp nhận hoặc đã hủy nên Quý Khách không thể tiếp tục thao tác'
                                        })
                                    }
                                })
                        }
                    })
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Đơn hàng không phù hợp!'
                })
            }
        })

})

router.delete('/cancel-food-order/:orderid', verifyToken, async (req, res) => {
    const orderid = req.params.orderid
    const decoded = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
    await new Order().verifyOrderWithCustomer(customerid, orderid)
        .then(async (result) => {
            if (result) {
                await new Order().checkIfOrderCouldBeUpdate(orderid)
                    .then(async (result) => {
                        if (result) {
                            await new Order().cancel(orderid)
                                .then((result) => {
                                    return res.status(200).json({
                                        success: true,
                                        message: 'Quý Khách đã hủy đơn thành công'
                                    })

                                })
                        } else {
                            return res.status(400).json({
                                success: false,
                                message: 'Đơn đặt món này đã được tiếp nhận hoặc đã hủy nên Quý Khách không thể tiếp tục thao tác'
                            })
                        }
                    })
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Đơn hàng không phù hợp!'
                })
            }
        })

})

router.get('/get-food-order-payment-status/:orderid', verifyToken, async (req, res) => {
    const orderid = req.params.orderid
    const decoded = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
    await new Order().verifyOrderWithCustomer(customerid, orderid)
        .then(async (result) => {
            if (result) {
                await new Order().getOrderPaymentStatus(orderid)
                    .then((result) => {
                        return res.status(200).json({
                            success: true,
                            payment_status: (result == 'vnpay') ? 'Chờ thanh toán bằng VNPay' : (result == 'cod') ? 'Chờ thanh toán bằng COD' : (result == 'Đã thanh toán COD') ? 'Đã thanh toán COD' : 'Đã thanh toán bằng VNPay'
                        })
                    })
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Đơn hàng không phù hợp!'
                })
            }
        })

})

router.get('/pay-for-food-order/:orderid', async (req, res) => {
    const orderid = req.params.orderid
    // const decoded = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET)
    const customerid = 'KH1'
    await new Order().verifyOrderWithCustomer(customerid, orderid)
        .then(async (result) => {
            if (result) {
                await new Order().getOrderPaymentStatus(orderid)
                    .then(async (result) => {
                        if (result == 'vnpay' || result == 'cod') {
                            await new Order().getOrderSubTotal(orderid)
                                .then((subtotal) => {
                                    if (subtotal != false) {
                                        var tzoffset = (new Date()).getTimezoneOffset() * 60000;
                                        var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
                                        res.redirect(VNPayURL(orderid, parseInt(subtotal),
                                            localISOTime.replace('T', ' ').replace('-', '').replace('-', '').replace(' ', '').replace(':', '').replace(':', '').replace(':', '').substring(0, 14)
                                        ))
                                    } else {
                                        return res.status(400).json({
                                            success: false,
                                            message: 'Đơn hàng lỗi do không có món ăn!'
                                        })
                                    }
                                })

                        } else if (result == false) {
                            return res.status(400).json({
                                success: false,
                                message: 'Đơn hàng đã bị hủy!'
                            })
                        } else {
                            return res.status(400).json({
                                success: false,
                                message: 'Đơn hàng đã được thanh toán!'
                            })
                        }
                    })
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Đơn hàng không phù hợp!'
                })
            }
        })

})

router.get('/order-payment-result', async (req, res) => {
    let payment = req.query
    if (payment.vnp_TransactionStatus == '00') {
        if (verifyHashcode(payment))
            await new Order().paid(payment.vnp_TxnRef, payment.vnp_TransactionNo)
                .then((result) => {
                    if (result)
                        return res.status(200).json({
                            success: true,
                            message: 'Đơn đã được thanh toán, ReFood xin cảm ơn Quý Khách',
                            payment_info: {
                                order_id: payment.vnp_TxnRef,
                                order_subtotal: payment.vnp_Amount,
                                order_bank: payment.vnp_BankCode,
                                order_paiddate: payment.vnp_PayDate
                            }
                        })
                    return res.status(200).json({
                        success: true,
                        message: 'Đơn đã được thanh toán trước đó, ReFood xin cảm ơn Quý Khách',
                        payment_info: {
                            order_id: payment.vnp_TxnRef,
                            order_subtotal: payment.vnp_Amount,
                            order_bank: payment.vnp_BankCode,
                            order_paiddate: payment.vnp_PayDate
                        }
                    })
                })
        else
            return res.status(400).json({
                success: false,
                message: 'Thanh toán không thành công, Quý Khách vui lòng thanh toán lại đơn hàng'
            })
    } else
        return res.status(400).json({
            success: false,
            message: 'Thanh toán không thành công, Quý Khách vui lòng thanh toán lại đơn hàng'
        })
})
module.exports = router