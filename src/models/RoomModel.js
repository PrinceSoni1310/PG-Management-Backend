const mongoose = require ("mongoose")
const schema = mongoose.Schema

const roomSchema  = new schema ({

    // roomId : {
    //     type  : String,
    //     required : true
    // },
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
        // default : ""
    }

})

module.exports = mongoose.model ("Rooms" ,roomSchema)