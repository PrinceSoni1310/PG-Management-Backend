const foodSchema = require("../models/FoodMenuModel")
const uploadtoCloudinary = require("../utils/CloudinaryUtils")

const createFoodMenu = async (req, res) => {
    try {
        const { menuType, pgId, title, description, startDate, endDate, ...menuData } = req.body;

        let menuDataToSave = {
            pgId,
            menuType,
            title,
            description,
            startDate,
            endDate
        };

        if (menuType === 'daily') {
            menuDataToSave.date = startDate;
            menuDataToSave.dailyMenu = menuData.dailyMenu;
        } else if (menuType === 'weekly') {
            menuDataToSave.weeklyMenu = menuData.weeklyMenu || [];
        } else if (menuType === 'monthly') {
            menuDataToSave.monthlyMenu = menuData.monthlyMenu || [];
        }

        // Handle image upload if provided
        if (req.file) {
            const cloudinaryResponse = await uploadtoCloudinary(req.file.path);
            menuDataToSave.imagePath = cloudinaryResponse.secure_url;
        }

        const foodMenu = await foodSchema.create(menuDataToSave);
        res.status(201).json({
            message: "Food menu created successfully",
            data: foodMenu
        });

    } catch (err) {
        console.error('Error creating food menu:', err);
        res.status(500).json({
            message: "Error while creating food menu",
            error: err.message
        });
    }
}

const getFoodMenus = async (req, res) => {
    try {
        const { pgId, menuType, date } = req.query;

        let query = { isActive: true };
        if (pgId) query.pgId = pgId;
        if (menuType) query.menuType = menuType;

        // If date is provided, find menus that include this date
        if (date) {
            const targetDate = new Date(date);
            query.$or = [
                { menuType: 'daily', date: targetDate },
                {
                    menuType: 'weekly',
                    startDate: { $lte: targetDate },
                    endDate: { $gte: targetDate }
                },
                {
                    menuType: 'monthly',
                    startDate: { $lte: targetDate },
                    endDate: { $gte: targetDate }
                }
            ];
        }

        const foodMenus = await foodSchema.find(query).sort({ createdAt: -1 });
        res.status(200).json({
            message: "Food menus fetched successfully",
            data: foodMenus
        });

    } catch (err) {
        console.error('Error fetching food menus:', err);
        res.status(500).json({
            message: "Error while fetching food menus",
            error: err.message
        });
    }
}

const updateFoodMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Handle image upload if provided
        if (req.file) {
            const cloudinaryResponse = await uploadtoCloudinary(req.file.path);
            updateData.imagePath = cloudinaryResponse.secure_url;
        }

        const updatedMenu = await foodSchema.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedMenu) {
            return res.status(404).json({
                message: "Food menu not found"
            });
        }

        res.status(200).json({
            message: "Food menu updated successfully",
            data: updatedMenu
        });

    } catch (err) {
        console.error('Error updating food menu:', err);
        res.status(500).json({
            message: "Error while updating food menu",
            error: err.message
        });
    }
}

const deleteFoodMenu = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedMenu = await foodSchema.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!deletedMenu) {
            return res.status(404).json({
                message: "Food menu not found"
            });
        }

        res.status(200).json({
            message: "Food menu deleted successfully",
            data: deletedMenu
        });

    } catch (err) {
        console.error('Error deleting food menu:', err);
        res.status(500).json({
            message: "Error while deleting food menu",
            error: err.message
        });
    }
}

// Legacy function for backward compatibility
const manageFood = async (req, res) => {
    try {
        const cloudinaryResponse = await uploadtoCloudinary(req.file.path);
        console.log("cloudinary response => ", cloudinaryResponse);

        const food = await foodSchema.create({ ...req.body, imagePath: cloudinaryResponse.secure_url });
        res.json({
            message: "Food-menu updated",
            data: food
        });

    } catch (err) {
        res.status(500).json({
            message: "Error while managing food-menu",
            err: err
        });
    }
}

// Legacy function for backward compatibility
const getAllFoodDetails = async (req, res) => {
    try {
        const getFoodDetails = await foodSchema.find({ isActive: true });
        res.status(200).json({
            message: "food-menu fetched...",
            data: getFoodDetails
        });

    } catch (err) {
        res.status(500).json({
            message: "error while getting food-menu",
            err: err
        });
    }
}

module.exports = {
    createFoodMenu,
    getFoodMenus,
    updateFoodMenu,
    deleteFoodMenu,
    manageFood,
    getAllFoodDetails
}