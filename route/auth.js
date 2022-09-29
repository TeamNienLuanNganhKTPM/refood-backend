const express = require('express')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const router = express.Router();
const Customer = require('../database/Customer')
const { v4: uuidv4 } = require('uuid');
const verifyToken = require('../authentication/auth')
const sha = require('sha1')
require('dotenv').config()
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
                        let access_token = `${jwt.sign({ CustomerId: foundedCustomer.CustomerId }, process.env.ACCESS_TOKEN_SECRET)}`
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
    else if (name.match(/^[a-zA-ZàáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ ,.'-]+$/u) == null)
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

router.put('/update/password', verifyToken, async (req, res) => {
    const { oldpassword, newpassword, repassword } = req.body
    const customerid = req.header('CustomerId')
    await new Customer()
        .findWithId(customerid)
        .then(async (foundedCustomer) => {
            if (foundedCustomer.CustomerId != null && foundedCustomer.CustomerState != 0) {
                if (sha(oldpassword) == foundedCustomer.CustomerPassword) {
                    if (newpassword == repassword) {
                        await new Customer()
                            .updatePassword(customerid, sha(newpassword))
                            .then((result) => {
                                if (result)
                                    return res.status(200).json({
                                        success: true,
                                        message: 'Đổi mật khẩu thành công'
                                    });
                                else
                                    return res.status(400).json({
                                        success: false,
                                        message: 'Quý khách vui lòng thử lại sau'
                                    });
                            })
                    } else
                        return res.status(400).json({
                            success: false,
                            message: 'Mật khẩu mới không khớp với mật khẩu xác nhận'
                        });
                } else
                    return res.status(400).json({
                        success: false,
                        message: 'Mật khẩu cũ không chính xác'
                    });
            } else
                return res.status(400).json({
                    success: false,
                    message: 'Tài khoản đã bị khóa hoặc không tồn tại'
                });
        })
        .catch((err) => setImmediate(() => {
            return res.status(400).json({
                success: false,
                message: 'Quý khách vui lòng thử lại sau'
            });
        }))
})

router.put('/update/info', verifyToken, async (req, res) => {
    const { phonenumber, name, email } = req.body
    const customerid = req.header('CustomerId')
    await new Customer()
        .findWithId(customerid)
        .then(async (foundedCustomer) => {
            if (foundedCustomer.CustomerId != null && foundedCustomer.CustomerState != 0) {
                if (email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/) == null && email != null) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email không hợp lệ'
                    });
                }
                else if (phonenumber.match(/(84|0[3|5|7|8|9])+([0-9]{8})\b/) == null) {
                    return res.status(400).json({
                        success: false,
                        message: 'Số điện thoại không hợp lệ'
                    });
                }
                else if (name.match(/^[a-zA-ZàáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ ,.'-]+$/u) == null) {
                    return res.status(400).json({
                        success: false,
                        message: 'Tên không hợp lệ'
                    });
                }
                else {
                    await new Customer()
                        .updateInfo(customerid, phonenumber, name, email)
                        .then((result) => {
                            if (result)
                                return res.status(200).json({
                                    success: true,
                                    message: 'Cập nhật thông tin thành công'
                                });
                            else {
                                return res.status(400).json({
                                    success: false,
                                    message: 'Quý khách vui lòng thử lại sau'
                                });
                            }
                        })
                        .catch((err) => {
                            if (err.code == 'ER_DUP_ENTRY')
                                return res.status(400).json({
                                    success: false,
                                    message: 'Số điện thoại Quý khách vừa nhập đã được đăng ký cho tài khoản khác'
                                });
                            else
                                return res.status(400).json({
                                    success: false,
                                    message: 'Quý khách vui lòng thử lại sau'
                                });
                        })

                }
            } else
                return res.status(400).json({
                    success: false,
                    message: 'Tài khoản đã bị khóa hoặc không tồn tại'
                });
        })
        .catch((err) => setImmediate(() => {
            return res.status(400).json({
                success: false,
                message: 'Quý khách vui lòng thử lại sau'
            });
        }))
})

router.get('/info', verifyToken, async (req, res) => {
    const customerid = req.header('CustomerId')
    await new Customer()
        .findWithId(customerid)
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
                message: 'Quý khách vui lòng thử lại sau'
            });
        }))
})

router.get('/info/:CustomerId', verifyToken, async (req, res) => {
    const customerid = req.params.CustomerId
    console.log(req.params)
    await new Customer()
        .findWithId(customerid)
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
                message: 'Quý khách vui lòng thử lại sau'
            });
        }))
})

module.exports = router