const mongoose = require("mongoose")
const schema = mongoose.Schema

const foodMenuSchema = new schema({
    pgId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PG",
        required: true
    },
    menuType: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    // For daily menus
    date: {
        type: Date
    },
    // For weekly menus - array of 7 days
    weeklyMenu: [{
        day: {
            type: String,
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        },
        breakfast: {
            type: String,
            default: ""
        },
        lunch: {
            type: String,
            default: ""
        },
        dinner: {
            type: String,
            default: ""
        }
    }],
    // For monthly menus - array of weeks (1st, 2nd, 3rd, 4th week)
    monthlyMenu: [{
        weekNumber: {
            type: Number,
            enum: [1, 2, 3, 4],
            required: true
        },
        weekLabel: {
            type: String,
            enum: ["1st Week", "2nd Week", "3rd Week", "4th Week"],
            required: true
        },
        weeklyMenu: [{
            day: {
                type: String,
                enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            },
            breakfast: {
                type: String,
                default: ""
            },
            lunch: {
                type: String,
                default: ""
            },
            dinner: {
                type: String,
                default: ""
            }
        }]
    }],
    // For daily menus - single day menu
    dailyMenu: {
        breakfast: {
            type: String,
            default: ""
        },
        lunch: {
            type: String,
            default: ""
        },
        dinner: {
            type: String,
            default: ""
        }
    },
    imagePath: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("FoodMenu", foodMenuSchema)