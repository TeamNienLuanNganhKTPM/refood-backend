const dbConnect = require('./dbconnect')

class Rating{
    constructor(RatingID, RatingCustomer, RatingFood, RatingMark){
        this.RatingID = RatingID
        this.RatingCustomer = RatingCustomer
        this.RatingFood = RatingFood
        this.RatingMark = RatingMark
    }

    async checkIfCanRate(RatingCustomer, RatingFood)

    async create(RatingCustomer, RatingFood, RatingMark)
}

module.exports = Rating