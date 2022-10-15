const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const verifyAdmin = require('../authentication/auth')
const Admin = require('../database/Admin');
const Customer = require('../database/Customer');
require('dotenv').config()
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
router.get('/user-info/:userPhonenumber', verifyAdmin, async (req, res) => {
    const userPhonenumber = req.params.userPhonenumber
    const token = req.header('Authorization')
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET)
    await new Customer()
        .find(userPhonenumber)
        .then((foundedCustomer) => {
            return res.status(200).json({
                success: true,
                customer_info: {
                    CustomerId: foundedCustomer.CustomerId,
                    CustomerName: foundedCustomer.CustomerName,
                    CustomerPhone: foundedCustomer.CustomerPhone,
                    CustomerEmail: foundedCustomer.CustomerEmail,
                    CustomerState: foundedCustomer.CustomerState,
                }
            });
        })
        .catch((err) => setImmediate(() => {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng thử lại sau'
            });
        }))
})

router.put('/user-active', verifyAdmin, async (req, res) => {
    const { userphonenumber, active_state } = req.body
    await new Admin()
        .updateUserActive(userphonenumber, active_state ? 1 : 0)
        .then((result) => {
            if (result)
                return res.status(200).json({
                    success: true,
                    blocked: active_state ? false : true,
                    message: "Cập nhật trạng thái khách hàng thành công"
                });
            return res.status(400).json({
                success: false,
                message: "Cập nhật trạng thái khách hàng không thành công, vui lòng thử lại sau"
            });
        })
        .catch((err) => setImmediate(() => {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng thử lại sau'
            });
        }))
})
module.exports = router