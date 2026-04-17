const mongoose = require ("mongoose")
const schema = mongoose.Schema

const roomSchema  = new schema ({
    pgId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "PG"
    },
    roomNumber : {
        type  : Number,
        required : true
    },
    totalBeds : {
        type  : Number,
        required : true
    },
    occupiedBeds : {
        type  : Number,
        required : true,
        default: 0
    },
    occupants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
})

module.exports = mongoose.model ("Rooms" ,roomSchema)