const jwt = require('jsonwebtoken')
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization')
    const CustomerId = req.header('CustomerId')
    const token = authHeader
    if (!token)
        return res.status(401).json({ success: false, message: 'Access token not found' })
    else {
        try {
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET)
            req.CustomerId = decoded.CustomerId
            if (CustomerId == req.CustomerId)
                next()
            else
                return res.status(403).json({ success: false, message: 'Invalid token' })
        } catch (err) {
            console.log(err)
            return res.status(403).json({ success: false, message: 'Invalid token' })
        }
    }
}
const verifyAdmin = (req, res, next) => {
    const token = req.header('Authorization')
    if (!token)
        return res.status(401).json({ success: false, message: 'Access token not found' })
    else {
        try {
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET)
            if (decoded.role == 'admin')
                next()
            else
                return res.status(400).json({ success: false, message: 'Invalid token' })
        } catch (err) {
            console.log(err)
            return res.status(400).json({ success: false, message: 'Invalid token' })
        }
    }
}
module.exports = verifyToken, verifyAdmin