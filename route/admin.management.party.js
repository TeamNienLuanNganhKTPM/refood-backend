const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const verifyAdmin = require('../authentication/auth')
const Party = require('../database/Party')
const Invoice = require('../database/Invoice')
const { orderStatus, getOrderPaymentMethod } = require('../function/orderStatus')
router.get('/get-party-orders/:pageCur/:numOnPage', verifyAdmin, async (req, res) => {
    await new Party().getAllForAdmin()
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
                parties: orderss,
            });
        })
})

router.get('/get-party-order-detail/:partyid', verifyAdmin, async (req, res) => {
    const partyid = req.params.partyid
    await new Party().get(partyid)
        .then((party) => {
            if (party != false)
                return res.status(200).json({
                    success: true,
                    party_detail: party
                })
            else
                return res.status(400).json({
                    success: false,
                    message: 'Đơn không tồn tại'
                })
        })
})

router.put('/update-party-order', verifyAdmin, async (req, res) => {
    const { partyid } = req.body
    await new Party().getPartyStatus(partyid)
        .then(async (result) => {
            if (result != false && result != orderStatus[2]) {
                let indexOrderStatus = orderStatus.indexOf(result);
                indexOrderStatus++;
                await new Party().updateForAdmin(partyid, orderStatus[indexOrderStatus])
                    .then(async (result) => {
                        if (indexOrderStatus == 2)
                            await new Invoice().create(partyid)
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
    const { partyid } = req.body
    await new Party().getPartyStatus(partyid)
        .then(async (result) => {
            if (result != false && result != orderStatus[2]) {
                let indexOrderStatus = orderStatus.indexOf(result);
                if (indexOrderStatus != 0)// && getOrderPaymentMethod(pttt) == 'Đã thanh toán qua VNPay')
                    return res.status(400).json({
                        success: false,
                        message: 'Đơn này không thể hủy',
                    })
                else {
                    await new Party().updateForAdmin(partyid, orderStatus[3])
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

module.exports = router


