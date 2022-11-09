const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const verifyAdmin = require('../authentication/auth')
const Comment = require('../database/Comment');
const { checkText } = require('../function/Inspect')
require('dotenv').config()
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
router.get('/get-unreply-comments/:foodid/:pageCur', verifyAdmin, async (req, res) => {
    await new Comment().getUnreplyComment()
        .then((comments) => {
            let numberToGet = 5 //số lượng comment trên 1 lần load
            let pageNum = Math.ceil(comments.length / numberToGet);
            const pageCur = (req.params.pageCur > pageNum) ? pageNum : (req.params.pageCur < 1) ? 1 : req.params.pageCur
            let commentss = []
            let curIndex = (pageCur - 1) * numberToGet
            let count = 0
            while (comments[curIndex] != null && count < numberToGet) {
                commentss.push(comments[curIndex])
                curIndex++
                count++
            }
            return res.status(200).json({
                success: true,
                countOnPage: commentss.length,
                pageCur,
                pageNum,
                comments: commentss
            });
        })
})

router.post('/reply', verifyAdmin, async (req, res) => {
    const { commentid, content } = req.body
    const token = req.header('Authorization')
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET)
    let adminid = decoded.AdminID
    if (!checkText(content))
        return res.status(400).json({ success: false, message: 'Bình luận có chứa ký tự không hợp lệ!' })
    else {
        await new Comment().replyComment(commentid, adminid, content)
            .then((result) => {
                return res.status(200).json({
                    success: true,
                    message: 'Đã trả lời bình luận của khách hàng'
                });
            })
            .catch((err) => {
                return res.status(400).json({
                    success: true,
                    message: 'Bình luận không tồn tại, không thể trả lời'
                });
            })
    }
})
module.exports = router