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
const order = require('./route/order');
const party = require('./route/party');
const invoice = require('./route/invoice')
const adminAuth = require('./route/admin.auth');
const adminAnalysis = require('./route/admin.analysis');
const adminManagementUser = require('./route/admin.management.user');
const adminManagementFood = require('./route/admin.management.food');
const adminManagementOrder = require('./route/admin.management.order')
const adminManagementParty = require('./route/admin.management.party')
const adminManagementComment = require('./route/admin.management.comment')
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
app.use('/admin/management/order', adminManagementOrder);
app.use('/admin/management/party', adminManagementParty);
app.use('/admin/management/comment', adminManagementComment);
app.use('/admin/analysis', adminAnalysis);
app.use('/auth', auth);
app.use('/food', food);
app.use('/cart', cart);
app.use('/order', order);
app.use('/party', party);
app.use('/invoice', invoice);
app.use('/cantho-units', canthounit);
