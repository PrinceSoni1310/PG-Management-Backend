const mongoose = require("mongoose")
const schema = mongoose.Schema

const reviewSchema = new schema ({

    tenantId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    pgId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "PG"
    },
    rating : {
        type : Number
    },
    comments : {
        type : String
    },

},{
    timestamps : true
})

module.exports = mongoose.model ("Review" , reviewSchema)