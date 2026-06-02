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
    city : {
        type  : String,
        required : true
    },
    state : {
        type  : String,
        required : true
    },
    pincode : {
        type  : String,
        required : true
    },
    contactNumber : {
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
    },
    upiId : {
        type : String,
        default : ''
    },
    scannerCode: {
        type: String,
        default: ''
    },
    rentPerBed : {
        type  : Number,
        required : true
    },
    amenities : [{
        type  : String
    }],
    description : {
        type  : String
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }

})

module.exports = mongoose.model("PG" , pgSchema)