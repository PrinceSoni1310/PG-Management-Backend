const mongoose  =  require ("mongoose")
const schema = mongoose.Schema

const pgSchema = new schema ({

    ownerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    pgName : {
        type  : String,
        required : true
    },
    address : {
        type  : String,
        required : true
    },
    totalRooms : {
        type  : Number,
        required : true
    },
    totalBeds : {
        type  : Number,
        required : true
    }

})

module.exports = mongoose.model("PG" , pgSchema)