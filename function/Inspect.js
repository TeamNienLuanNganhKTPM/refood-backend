const checkDateTime = (datetime)=>{
    if (datetime.match(/^(\d{4,})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}(?:\.\d+)?))?$/u) == null)
        return false
    return true
}
const checkNumber = (number) => {
    if (number.match(/^([1-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-9][0-9][0-9][0-9])+$/u) == null)
        return false
    return true
}
const checkText = (text) => {
    if (text.match(/^[0-9a-zA-ZàáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ ,.!?<>@#$%^&;:-=+*/()|{}'-]+$/u) == null)
        return false
    return true
}
const checkMail = (mail) => {
    if (mail.match(/^[a-zA-ZàáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ ,.'-]+$/u) == null)
        return false
    return true
}
const checkPhoneNumber = (phone) => {
    if (phone.match(/^[a-zA-ZàáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ ,.'-]+$/u) == null)
        return false
    return true
}

const checkPaymentMethod = (method) => {
    return (method == 'vnpay' || method == 'cod')
}
module.exports = {
    checkDateTime,
    checkNumber,
    checkText,
    checkMail,
    checkPhoneNumber,
    checkPaymentMethod
}