const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const Cart = require('../database/Cart')
const verifyToken = require('../authentication/auth')
router.post('/create-food-order', verifyToken, async (req, res) => {

    const decoded = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET)
    const customerid = decoded.CustomerId
    
})

module.exports = router