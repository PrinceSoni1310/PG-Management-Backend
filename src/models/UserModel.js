const mongoose = require("mongoose")
const schema = mongoose.Schema

const userSchema = new schema({

    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ["Admin", "Owner", "Tenant"]
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword : {
        type : String,
        required : true
    }

}, {
    timestamps: true
})

module.exports = mongoose.model("User", userSchema)