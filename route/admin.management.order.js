const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const verifyAdmin = require('../authentication/auth')
const Order = require('../database/Order')
const Invoice = require('../database/Invoice')
const { orderStatus, getOrderPaymentMethod } = require('../function/orderStatus')
router.get('/get-food-orders/:pageCur/:numOnPage', verifyAdmin, async (req, res) => {
    await new Order().getAllForAdmin()
        .then((orders) => {
            let numberToGet = parseInt(req.params.numOnPage) //số lượng món ăn trên 1 trang
            let pageNum = Math.ceil(orders.length / numberToGet);
            const pageCur = (req.params.pageCur > pageNum) ? pageNum : (req.params.pageCur < 1) ? 1 : req.params.pageCur
            let orderss = []
            let curIndex = (pageCur - 1) * numberToGet
            let count = 0
            while (orders[curIndex] != null && count < numberToGet) {
                orderss.push(orders[curIndex])
                curIndex++
                count++
            }
            return res.status(200).json({
                success: true,
                countOnPage: orderss.length,
                pageCur,
                pageNum,
                orders: orderss,
            });
        })
})

router.get('/get-food-order-detail/:orderid', verifyAdmin, async (req, res) => {
    const orderid = req.params.orderid
    await new Order().get(orderid)
        .then((order) => {
            if (order != false)
                return res.status(200).json({
                    success: true,
                    order_detail: order
                })
            else
                return res.status(400).json({
                    success: false,
                    message: 'Đơn không tồn tại'
                })
        })
})

router.put('/update-food-order', verifyAdmin, async (req, res) => {
    const { orderid } = req.body
    let pttt = false;
    await new Order().getOrderStatus(orderid)
        .then((result) => pttt = result)
    await new Order().getOrderStatus(orderid)
        .then(async (result) => {
            if (result != false && result != orderStatus[2]) {
                let indexOrderStatus = orderStatus.indexOf(result);
                indexOrderStatus++;
                await new Order().updateForAdmin(orderid, orderStatus[indexOrderStatus])
                    .then(async (result) => {
                        if (indexOrderStatus == 2 && pttt == 'cod')
                            await new Invoice().create(orderid)
                        return res.status(200).json({
                            success: true,
                            message: 'Đã cập nhật trạng thái đơn hàng'
                        })
                    })
                    .catch((err) => {
                        return res.status(400).json({
                            success: false,
                            message: 'Vui lòng thử lại sau'
                        })
                    })
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Đơn này không thể cập nhật'
                })
            }
        })
        .catch((err) => {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng thử lại sau'
            })
        })
})

router.put('/cancel-order', verifyAdmin, async (req, res) => {
    const { orderid } = req.body
    let pttt = false;
    await new Order().getOrderPaymentStatus(orderid)
        .then((result) => pttt = result)
    await new Order().getOrderStatus(orderid)
        .then(async (result) => {
            if (result != false && result != orderStatus[2]) {
                let indexOrderStatus = orderStatus.indexOf(result);
                if (indexOrderStatus != 0)// && getOrderPaymentMethod(pttt) == 'Đã thanh toán qua VNPay')
                    return res.status(400).json({
                        success: false,
                        message: 'Đơn này không thể hủy',
                    })
                else {
                    await new Order().updateForAdmin(orderid, orderStatus[3])
                        .then((result) => {
                            return res.status(200).json({
                                success: true,
                                message: 'Đã hủy đơn hàng'
                            })
                        })
                        .catch((err) => {
                            return res.status(400).json({
                                success: false,
                                message: 'Vui lòng thử lại sau'
                            })
                        })
                }
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Đơn này không thể hủy'
                })
            }
        })
        .catch((err) => {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng thử lại sau'
            })
        })
})

router.get('/filter/:pageCur/:numOnPage', verifyAdmin, async (req, res) => {
    let { orderid, customerphone, datestart, dateend } = req.query
    await new Order().filter(orderid, customerphone, datestart, dateend)
    .then((orders) => {
        let numberToGet = parseInt(req.params.numOnPage) //số lượng món ăn trên 1 trang
        let pageNum = Math.ceil(orders.length / numberToGet);
        const pageCur = (req.params.pageCur > pageNum) ? pageNum : (req.params.pageCur < 1) ? 1 : req.params.pageCur
        let orderss = []
        let curIndex = (pageCur - 1) * numberToGet
        let count = 0
        while (orders[curIndex] != null && count < numberToGet) {
            orderss.push(orders[curIndex])
            curIndex++
            count++
        }
        return res.status(200).json({
            success: true,
            countOnPage: orderss.length,
            pageCur,
            pageNum,
            orders: orderss,
        });
    })
})
module.exports = router


