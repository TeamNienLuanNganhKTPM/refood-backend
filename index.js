const express = require('express')
require('dotenv').config()
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT
const auth = require('./route/auth');
const food = require('./route/food');
const cart = require('./route/cart');
const adminAuth = require('./route/admin.auth');
const adminManagementUser = require('./route/admin.management.user');
const adminManagementFood = require('./route/admin.management.food');
const canthounit = require('./route/cantho-units');
app.use(express.json())
////JSON PARSER
app.use(bodyParser.json({ limit: '10000mb', extended: true }));
app.use(bodyParser.urlencoded({
    limit: '10000mb',
    parameterLimit: 100000,
    extended: true
}));
////FILE UPLOAD
app.use(fileUpload({
    limits: { fileSize: 1024 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));
app.use(cors());
app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`)
})
app.get('/', (req, res) => {
    res.status(200).json({ status: true, message: 'ReFood App api by Lieu Tuan Vu B1906810' })
});
app.use('/admin/auth', adminAuth);
app.use('/admin/management/user', adminManagementUser);
app.use('/admin/management/food', adminManagementFood);
app.use('/auth', auth);
app.use('/food', food);
app.use('/cart', cart);
app.use('/cantho-units', canthounit);
