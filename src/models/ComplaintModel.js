const mongoose = require ("mongoose")
const schema = mongoose.Schema

const complaintSchema = new schema ({

    tenantId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    pgId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "PG"
    },
    category : {
        type : String  // which type of complaint , plumbing , food , electric ,cleaning etc...
    },
    description : {
        type : String  // Detailed explanation of the issue.
    },
    status : {
        type : String,
        enum : ["pending" , "in-progress" , "Resolved"]  //Current status of the issue. 
    }

},{
    timestamps : true
})

module.exports = mongoose.model("Complaint",complaintSchema)