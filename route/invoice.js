const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const Invoice = require('../database/Invoice');
const verifyToken = require('../authentication/auth')
router.get('/get-all-invoice/:pageCur/:numOnPage', verifyToken, async (req, res) => {
    const decoded = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
    await new Invoice().getAll(customerid)
        .then((invoicies) => {
            if (invoicies.length > 0) {
                let numberToGet = parseInt(req.params.numOnPage) //số lượng món ăn trên 1 trang
                let pageNum = Math.ceil(invoicies.length / numberToGet);
                const pageCur = (req.params.pageCur > pageNum) ? pageNum : (req.params.pageCur < 1) ? 1 : req.params.pageCur
                let invoiciess = []
                let curIndex = (pageCur - 1) * numberToGet
                let count = 0
                while (invoicies[curIndex] != null && count < numberToGet) {
                    invoiciess.push(invoicies[curIndex])
                    curIndex++
                    count++
                }
                return res.status(200).json({
                    success: true,
                    countOnPage: invoiciess.length,
                    pageCur,
                    pageNum,
                    invoicies: invoiciess,
                });
            }
            else
                return res.status(200).json({
                    success: true,
                    message: 'Quý khách chưa có hóa đơn nào, hãy đặt hàng tại ReFood nhé'
                })
        })
})

router.get('/get-invoice-detail/:invoiceid', verifyToken, async (req, res) => {
    const invoiceid = req.params.invoiceid
    const decoded = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
    await new Invoice().getDetail(customerid, invoiceid)
        .then((invoice) => {
            if (invoice != false)
                return res.status(200).json({
                    success: true,
                    invoice_detail: invoice
                })
            else
                return res.status(400).json({
                    success: false,
                    message: 'Hóa đơn không tồn tại'
                })
        })
})
module.exports = router