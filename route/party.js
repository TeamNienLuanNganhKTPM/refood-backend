const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const Cart = require('../database/Cart')
const Address = require('../database/Address')
const verifyToken = require('../authentication/auth')
const { checkText, checkPaymentMethod, checkNumber, checkDateTime } = require('../function/Inspect');
const Order = require('../database/Order');
const Party = require('../database/Party');
router.post('/create-party', verifyToken, async (req, res) => {
    const { place, type, timestart, numberoftable, partynote } = req.body
    const decoded = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
    if (partynote && !checkText(partynote))
        return res.status(400).json({
            success: false,
            message: 'Nội dung ghi chú không phù hợp'
        })
    if (!checkText(place))
        return res.status(400).json({
            success: false,
            message: 'Nội dung địa điểm không phù hợp'
        })
    if (!checkText(type))
        return res.status(400).json({
            success: false,
            message: 'Nội dung loại tiệc không phù hợp'
        })
    if (!checkNumber(numberoftable))
        return res.status(400).json({
            success: false,
            message: 'Nội dung số bàn tiệc không phù hợp'
        })
    if (!checkDateTime(timestart))
        return res.status(400).json({
            success: false,
            message: 'Nội dung thời gian đãi tiệc không phù hợp'
        })
    await new Cart().getCartDetail(customerid)
        .then(async (result) => {
            if (result.length <= 0)
                return res.status(400).json({
                    success: false,
                    message: 'Quý Khách chưa chọn món ăn nào để vào giỏ món'
                })
            else {
                await new Cart().verifyCartForParty(customerid)
                    .then(async (result) => {
                        if (result) {
                            await new Cart().getCartSubTotalForParty(customerid, numberoftable)
                                .then(async (result) => {
                                    if (result > 0)
                                        await new Party().create(customerid, place, type, timestart, partynote, numberoftable, result)
                                            .then((result) => {
                                                console.log(result)
                                                return res.status(200).json({
                                                    success: true,
                                                    message: 'Đơn của Quý Khách đã được tạo',
                                                    party_info: result
                                                })
                                            })
                                    else
                                        return res.status(400).json({
                                            success: false,
                                            message: 'Quý Khách chưa chọn món ăn nào để vào giỏ món'
                                        })
                                })
                        }
                        else {
                            return res.status(400).json({
                                success: false,
                                message: 'Giỏ hàng của Quý khách có món ăn không thể đặt tiệc do có khẩu phần dưới 10 người'
                            })
                        }
                    })

            }
        })
})

router.get('/get-all-parties/:pageCur/:numOnPage', verifyToken, async (req, res) => {
    const decoded = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
    await new Party().getAll(customerid)
        .then((parties) => {
            let numberToGet = parseInt(req.params.numOnPage) //số lượng món ăn trên 1 trang
            let pageNum = Math.ceil(parties.length / numberToGet);
            const pageCur = (req.params.pageCur > pageNum) ? pageNum : (req.params.pageCur < 1) ? 1 : req.params.pageCur
            let partiess = []
            let curIndex = (pageCur - 1) * numberToGet
            let count = 0
            while (parties[curIndex] != null && count < numberToGet) {
                partiess.push(parties[curIndex])
                curIndex++
                count++
            }
            return res.status(200).json({
                success: true,
                countOnPage: partiess.length,
                pageCur,
                pageNum,
                parties: partiess,
            });
        })
})

router.get('/get-party-detail/:partyid', verifyToken, async (req, res) => {
    const partyid = req.params.partyid
    const decoded = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
    await new Party().verifyPartyWithCustomer(customerid, partyid)
        .then(async (result) => {
            if (result)
                await new Party().get(partyid)
                    .then((party) => {
                        return res.status(200).json({
                            success: true,
                            party_detail: party
                        })
                    })
            else
                return res.status(400).json({
                    success: false,
                    message: 'Đơn tiệc không phù hợp!'
                })
        })
})

router.put('/update-party/:partyid', verifyToken, async (req, res) => {
    const { place, type, numberoftable, timestart, partynote } = req.body
    const partyid = req.params.partyid
    const decoded = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
    await new Party().verifyPartyWithCustomer(customerid, partyid)
        .then(async (result) => {
            if (result) {
                if (partynote && !checkText(partynote))
                    return res.status(400).json({
                        success: false,
                        message: 'Nội dung ghi chú không phù hợp'
                    })
                if (!checkText(place))
                    return res.status(400).json({
                        success: false,
                        message: 'Nội dung địa điểm không phù hợp'
                    })
                if (!checkText(type))
                    return res.status(400).json({
                        success: false,
                        message: 'Nội dung loại tiệc không phù hợp'
                    })
                if (!checkNumber(numberoftable))
                    return res.status(400).json({
                        success: false,
                        message: 'Nội dung số bàn tiệc không phù hợp'
                    })
                if (!checkDateTime(timestart))
                    return res.status(400).json({
                        success: false,
                        message: 'Nội dung thời gian đãi tiệc không phù hợp'
                    })
                await new Party().checkIfPartyCouldBeUpdate(partyid)
                    .then(async (result) => {
                        if (result) {
                            await new Party().update(customerid, partyid, place, timestart, numberoftable, partynote, type)
                                .then((result) => {
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

            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Đơn hàng không phù hợp!'
                })
            }
        })

})

router.delete('/cancel-party/:partyid', verifyToken, async (req, res) => {
    const partyid = req.params.partyid
    const decoded = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
    await new Party().verifyPartyWithCustomer(customerid, partyid)
        .then(async (result) => {
            if (result) {
                await new Party().checkIfPartyCouldBeUpdate(partyid)
                    .then(async (result) => {
                        if (result) {
                            await new Party().cancel(partyid)
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

module.exports = router