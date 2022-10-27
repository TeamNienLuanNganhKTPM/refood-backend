const orderStatus = [
    'Chờ xác nhận',
    'Đang thực hiện',
    'Đã hoàn thành',
    'Đã hủy'
]

const getOrderPaymentMethod = (paymentmethod) => {
    return paymentmethod == 'cod' ? 'COD' : paymentmethod == 'vnpay' ? 'VNPay' : 'Đã thanh toán qua VNPay'
}

module.exports = {
    getOrderPaymentMethod,
    orderStatus
}