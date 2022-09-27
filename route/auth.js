const express = require('express')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const router = express.Router();
const Customer = require('../database/Customer')
const { v4: uuidv4 } = require('uuid');
const verifyToken = require('../authentication/auth')
const sha = require('sha1')
router.post('/login', async (req, res) => {
    const { phonenumber, password } = req.body;
    if (!phonenumber || !password)
        return res.status(200).json({ success: false, message: 'Phone number or password is missing' })
    else if (phonenumber.match(/.*\S.*/) == null || password.match(/.*\S.*/) == null)
        return res.status(200).json({ success: false, message: 'Phone number or password is missing' })
    else if (phonenumber.match(/(84|0[3|5|7|8|9])+([0-9]{8})\b/) == null)
        return res.status(200).json({ success: false, message: 'Phone number is not valid' })
    else {
        try {
            let foundedCustomer
            await new Customer()
                .findWithPassword(phonenumber)
                .then((customer) => {
                    foundedCustomer = customer
                })
                .catch((err) => setImmediate(() => { throw err; }))
            if (foundedCustomer.CustomerId != undefined) {
                let passwordValid = sha(password) == foundedCustomer.CustomerPassword
                //await argon2.verify(foundedCustomer.CustomerPassword, password)
                if (!passwordValid)
                    return res.status(200).json({ success: false, message: 'Incorrect password' })
                else {
                    if (foundedCustomer.CustomerState == 0)
                        return res.status(200).json({ success: false, message: 'Customer user is blocked' })
                    else {
                        let access_token = jwt.sign({ CustomerId: foundedCustomer.CustomerId }, process.env.ACCESS_TOKEN_SECRET)
                        return res.status(200).json({
                            success: true, message: 'Login successfully',
                            access_token,
                            customer_info: {
                                CustomerId: foundedCustomer.CustomerId,
                                CustomerName: foundedCustomer.CustomerName,
                                CustomerPhone: foundedCustomer.CustomerPhone,
                                CustomerEmail: foundedCustomer.CustomerEmail,
                                CustomerState: foundedCustomer.CustomerState,
                            }
                        });
                    }
                }
            } else
                return res.status(200).json({ success: false, message: 'The phone number does not belong to any user' });
        } catch (err) {
            console.log(err)
            return res.status(500).json({ success: false, message: 'Internal server error' })
        }
    }
})

router.post('/register', async (req, res) => {
    const { phonenumber, password, name, repassword } = req.body;
    if (!phonenumber || !password)
        return res.status(400).json({ success: false, message: 'Phone number or password is missing' })
    else if (phonenumber.match(/.*\S.*/) == null || password.match(/.*\S.*/) == null)
        return res.status(400).json({ success: false, message: 'Phone number or password is missing' })
    else if (phonenumber.match(/(84|0[3|5|7|8|9])+([0-9]{8})\b/) == null)
        return res.status(400).json({ success: false, message: 'Phone number is not valid' })
    else if (password !== repassword)
        return res.status(400).json({ success: false, message: 'Password is not match' })
    else if (!name.match(/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u) == null)
        return res.status(400).json({ success: false, message: 'Name is not valid!' })
    else
        try {
            let foundedCustomer
            await new Customer()
                .find(phonenumber)
                .then((customer) => {
                    foundedCustomer = customer
                })
                .catch((err) => setImmediate(() => { throw err; }))
            if (foundedCustomer.CustomerId == undefined) {
                let hashPassword = await argon2.hash(password)
                let newAddedCustomer
                await new Customer()
                    .create(uuidv4(), name, phonenumber, null, password, 1)
                    .then((customer) => {
                        newAddedCustomer = customer
                    })
                    .catch((err) => setImmediate(() => { throw err; }))
                console.log(newAddedCustomer)
                if (newAddedCustomer.CustomerPhone != undefined)
                    return res.status(200).json({
                        success: true, message: 'Register successfully',
                        customer_info: {
                            CustomerId: newAddedCustomer.CustomerId,
                            CustomerName: newAddedCustomer.CustomerName,
                            CustomerPhone: newAddedCustomer.CustomerPhone,
                            CustomerEmail: newAddedCustomer.CustomerEmail,
                            CustomerState: newAddedCustomer.CustomerState,
                        }
                    });
            } else
                return res.status(400).json({ success: false, message: 'Phone number is already registed for another user' });
        } catch (err) {
            console.log(err)
            return res.status(500).json({ success: false, message: 'Internal server error' })
        }

})

router.post('/change-password', verifyToken, async (req, res) => {
    
})
module.exports = router