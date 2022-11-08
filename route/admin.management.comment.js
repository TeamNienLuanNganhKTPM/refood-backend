const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const verifyAdmin = require('../authentication/auth')
const Admin = require('../database/Admin');
const Customer = require('../database/Customer');
require('dotenv').config()
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
router.get('/get-unreply-comments', verifyAdmin, async (req, res) => {
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

module.exports = router