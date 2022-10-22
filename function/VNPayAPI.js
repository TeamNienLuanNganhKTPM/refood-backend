const querystring = require('qs');
const crypto = require("crypto");
require('dotenv').config()
const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
const secretKey = "KXEVPMEKJMBDMTWCGQIAATDIPIPTLNUA"
const tmnCode = "VE1T6Q4P"
const sortObject = (obj) => {
    var sorted = {};
    var str = [];
    var key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}
const VNPayURL = (orderId, subtotal, createDate) => {
    var bankCode = ''
    var vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Merchant'] = 'ReFood Restaurant'
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = `ReFood - Thanh toán đơn ${orderId}`;
    vnp_Params['vnp_OrderType'] = 'billpayment';
    vnp_Params['vnp_Amount'] = subtotal * 100;
    vnp_Params['vnp_ReturnUrl'] = process.env.URL_PAYMENT_CALLBACK;
    vnp_Params['vnp_IpAddr'] = '::1';
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode !== null && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
    }
    vnp_Params = sortObject(vnp_Params);

    var signData = querystring.stringify(vnp_Params, { encode: false });
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;
    return `${vnpUrl}?${querystring.stringify(vnp_Params, { encode: false })}`
}

const verifyHashcode = (query) => {
    var vnp_Params = query;
    var secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    var signData = querystring.stringify(vnp_Params, { encode: false });
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
    if (secureHash === signed)
        return true
    return false
}
module.exports = {
    VNPayURL, verifyHashcode
}