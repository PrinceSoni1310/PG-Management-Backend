const mongoose =  require ("mongoose")
const schema = mongoose.Schema

const patmentSchema = new schema ({

    // paymentId : {
    //     type : String
    // },
    tenantId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    amount : {
        type : Number ,
    },
    paymentType  : { 
        type : String,
        enum : ["rent" , "deposit"]
    },
    dueDate : {
        type : Date,
    },
    paymentDate : {
        type : Date
    },
    status : {
        type : String,
        enum : ["paid" , "pending"]  // "overdue" we can add
    }

})