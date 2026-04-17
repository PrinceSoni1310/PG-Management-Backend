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

    // ✅ FIXED ROLE (LOWERCASE)
    role: {
        type: String,
        enum: ["admin", "owner", "tenant"],
        required: true
    },

    password: {
        type: String,
        required: true
    },

    pgId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PG"
    },

    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rooms"
    },

    phone: {
        type: String,
        default: ''
    },

    address: {
        type: String,
        default: ''
    }

}, {
    timestamps: true
})

module.exports = mongoose.model("User", userSchema)