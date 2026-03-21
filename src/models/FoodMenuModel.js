const mongoose = require ("mongoose")
const schema = mongoose.Schema

const foodMenuSchema = new schema ({

    pgId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "PG"
    },
    date  : {
        type : Date,
    },
    breakfastItem : {
        type : String 
    },
    lunchItem : {
        type : String
    },
    dinnerItem : {
        type : String
    },
    imagePath : {
        type : String
    }

})

module.exports = mongoose.model("FoodMenu" , foodMenuSchema)