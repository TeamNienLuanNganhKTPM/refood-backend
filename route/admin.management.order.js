const express = require('express')
const router = express.Router();
const verifyAdmin = require('../authentication/auth')
const Order = require('../database/Order')
router.get('/get-all-food-orders/:pageCur/:numOnPage', verifyAdmin, async (req, res) => {
    const decoded = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
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

module.exports = router


