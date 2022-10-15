const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const verifyAdmin = require('../authentication/auth')
const sha = require('sha1');
const Admin = require('../database/Admin');
require('dotenv').config()
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
router.post('/login', async (req, res) => {
    const { phonenumber, password } = req.body;
    if (!phonenumber || !password)
        return res.status(400).json({ success: false, message: 'Số điện thoại hoặc mật khẩu không chính xác' })
    else if (phonenumber.match(/(84|0[3|5|7|8|9])+([0-9]{8})\b/) == null)
        return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ' })
    else {
        try {
            let foundedAdmin
            await new Admin()
                .login(phonenumber, sha(password))
                .then((admin) => {
                    foundedAdmin = admin
                })
                .catch((err) => setImmediate(() => { throw err; }))
            if (foundedAdmin != undefined) {
                let admin_access_token = `${jwt.sign({ AdminID: foundedAdmin.AdminID, role: "admin" }, process.env.ACCESS_TOKEN_SECRET)}`
                return res.status(200).json({
                    success: true,
                    message: 'Đăng nhập thành công',
                    admin_access_token,
                    admin_info: {
                        AdminID: foundedAdmin.AdminID,
                        AdminName: foundedAdmin.AdminName,
                        AdminPhoneNumber: foundedAdmin.AdminPhoneNumber
                    }
                });
            } else
                return res.status(400).json({ success: false, message: 'Thông tin đăng nhập không đúng' })
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Lỗi hệ thống' })
        }
    }
})

router.put('/update/password', verifyAdmin, async (req, res) => {
    const { oldpassword, newpassword, repassword } = req.body
    const token = req.header('Authorization')
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET)
    await new Admin()
        .findWithId(decoded.AdminID)
        .then(async (foundedAdmin) => {
            if (foundedAdmin.AdminID != null) {
                if (sha(oldpassword) == foundedAdmin.AdminPassword) {
                    if (newpassword == repassword) {
                        await new Admin()
                            .updatePassword(foundedAdmin.AdminID, sha(newpassword))
                            .then((result) => {
                                if (result)
                                    return res.status(200).json({
                                        success: true,
                                        message: 'Đổi mật khẩu thành công'
                                    });
                                else
                                    return res.status(400).json({
                                        success: false,
                                        message: 'Vui lòng thử lại sau'
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
                message: 'Vui lòng thử lại sau'
            });
        }))
})

router.get('/info', verifyAdmin, async (req, res) => {
    const token = req.header('Authorization')
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET)
    await new Admin()
        .findWithId(decoded.AdminID)
        .then((foundedAdmin) => {
            return res.status(200).json({
                success: true,
                admin_info: {
                    AdminID: foundedAdmin.AdminID,
                    AdminName: foundedAdmin.AdminName,
                    AdminPhoneNumber: foundedAdmin.AdminPhoneNumber
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