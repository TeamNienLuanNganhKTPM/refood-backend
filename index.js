const express = require('express')
require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT
const auth = require('./route/auth');
const food = require('./route/food');
app.use(express.json())
app.use(bodyParser.json({ limit: '10000mb', extended: true }));
app.use(bodyParser.urlencoded({
    limit: '10000mb',
    parameterLimit: 100000,
    extended: true
}));
app.use(cors());
app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`)
})
app.get('/', (req, res) => {
    res.status(200).json({ status: true, message: 'ReFood App api by Lieu Tuan Vu B1906810' })
});

app.use('/auth', auth);
app.use('/food', food);

