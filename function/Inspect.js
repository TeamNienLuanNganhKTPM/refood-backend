const checkDateTime = (datetime) => {
    if (datetime.match(/^(\d{4,})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}(?:\.\d+)?))?$/u) == null)
        return false
    return true
}
const checkDate = (date) => {
    if (date.match(/^(\d{4,})-(\d{2})-(\d{2})?$/u) == null)
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

const checkFoodImage = (foodimage) => {
    let isImage = true;
    if (Array.isArray(foodimage)) {
        foodimage.forEach(image => {
            if (image.name.match(/([\w-]+.(jpg|png|jpeg|PNG|JPG|JPEG))$/g) == null)
                isImage = false
        })
    } else {
        if (foodimage.name.match(/([\w-]+.(jpg|png|jpeg|PNG|JPG|JPEG))$/g) == null)
            isImage = false
    }
    return isImage
}

const checkRateScore = (number) => {
    if (number.match(/^([1-5]$)/g) != null)
        return true
    return false
}

const nhuan = (y) => {
    return ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0);
}

const soNgayTrongThang = (m, y) => {
    switch (m) {
        case 1: case 3: case 5: case 7: case 8: case 10: case 12: {
            return 31;
        }
        case 2: {
            if (nhuan(y)) {
                return 29;
            }
            return 28;
        }
        case 4: case 6: case 9: case 11: {
            return 30;
        }
    }
}
module.exports = {
    checkFoodImage,
    checkDateTime,
    checkNumber,
    checkText,
    checkMail,
    checkPhoneNumber,
    checkPaymentMethod,
    checkRateScore,
    soNgayTrongThang
}