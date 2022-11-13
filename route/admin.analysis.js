const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const verifyAdmin = require('../authentication/auth')
const sha = require('sha1');
const Admin = require('../database/Admin');
require('dotenv').config()
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
router.get('/', verifyAdmin, async (req, res) => {
    const token = req.header('Authorization')
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET)
    let num_of_order = 0
    let num_of_foods = 0
    let num_of_customers = 0
    let total_revenue = 0
    await new Admin()
        .analysisOrder()
        .then((orders) => {
            num_of_order = orders
        })
    await new Admin()
        .analysisFood()
        .then((foods) => {
            num_of_foods = foods
        })
    await new Admin()
        .analysisCustomer()
        .then((customers) => {
            num_of_customers = customers
        })
    await new Admin()
        .analysisRevenue()
        .then((revenue) => {
            total_revenue = revenue
        })
    return res.status(200).json({
        success: true,
        analysis: {
            num_of_order,
            num_of_foods,
            num_of_customers,
            total_revenue
        }
    })
})

router.get('/:month/:year', verifyAdmin, async (req, res) => {
    const { month, year } = req.params
    const token = req.header('Authorization')
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET)
    let num_of_order = 0
    let num_of_foods = 0
    let num_of_customers = 0
    let total_revenue = 0
    await new Admin()
        .analysisOrder()
        .then((orders) => {
            num_of_order = orders
        })
    await new Admin()
        .analysisFood()
        .then((foods) => {
            num_of_foods = foods
        })
    await new Admin()
        .analysisCustomer()
        .then((customers) => {
            num_of_customers = customers
        })
    await new Admin()
        .analysisRevenueByTime(month, year)
        .then((revenue) => {
            total_revenue = revenue
        })
    return res.status(200).json({
        success: true,
        analysis: {
            num_of_order,
            num_of_foods,
            num_of_customers,
            total_revenue
        }
    })
})

router.get('/revenue-chart/:month/:year', verifyAdmin, async (req, res) => {
    const { month, year } = req.params
    await new Admin()
        .analysisRevenueByTimeEachDay(month, year)
        .then((revenue) => {
            return res.status(200).json({
                success: true,
                month,
                year,
                revenue
            })
        })
})

router.get('/revenue-chart/with/year/:year', verifyAdmin, async (req, res) => {
    const { year } = req.params
    await new Admin()
        .analysisRevenueByTimeEachMonth(year)
        .then((revenue) => {
            return res.status(200).json({
                success: true,
                year,
                revenue
            })
        })
})
module.exports = router