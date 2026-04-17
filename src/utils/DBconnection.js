const mongoose = require("mongoose")
require("dotenv").config()

const DBconnection = () => {
    mongoose.connect(process.env.MONGODB_URL).then(()=> {
        console.log("DB Connected");
    }).catch((e)=> {
        console.log(e); 
    })
}

module.exports = DBconnection
