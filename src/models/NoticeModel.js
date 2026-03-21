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
    message : {
        type : String //Detailed content of the announcement.
    },
    postedDate : {
        type : Date  //Timestamp of when the notice was published. 
    } 

})

module.exports = mongoose.model("Notice" , noticeSchema)