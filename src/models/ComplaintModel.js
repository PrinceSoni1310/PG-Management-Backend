const mongoose = require ("mongoose")
const schema = mongoose.Schema

const complaintSchema = new schema ({
    tenantId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true
    },
    pgId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "PG",
        required: true
    },
    ownerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true
    },
    category : {
        type : String,
        required: true
        // which type of complaint , plumbing , food , electric ,cleaning etc...
    },
    description : {
        type : String,
        required: true
        // Detailed explanation of the issue.
    },
    status : {
        type : String,
        enum : ["pending" , "in-progress" , "resolved"],
        default: "pending"
        //Current status of the issue. 
    }
},{
    timestamps : true
})

module.exports = mongoose.model("Complaint",complaintSchema)