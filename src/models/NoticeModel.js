const mongoose = require ("mongoose")
const schema = mongoose.Schema

const noticeSchema = new schema ({

    pgId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "PG"
    },
    title : {
        type : String, // Subject/Headline of the notice. 
    },
    content : {
        type : String //Detailed content of the announcement.
    },
    createdAt : {
        type : Date,
        default: Date.now
    } 

})

module.exports = mongoose.model("Notice" , noticeSchema)