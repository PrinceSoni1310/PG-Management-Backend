const roomSchema = require ("../models/RoomModel")

const manageRooms = async (req,res) => {

    try{

        const savedRooms = await roomSchema.create(req.body)
        res.status(201).json({
            message : "Room details Saved",
            data : savedRooms
        })

    }catch(err){
        res.status(500).json({
            message : "Error in room management",
            err : err
        })
    }
}

const getRooms = async(req , res) => {

    try {

        const getRoomDetails = await roomSchema.find()
        res.status(200).json({
            message : "Room details fetched",
            data : getRoomDetails
        })

    }catch(err){
        res.status(500).json({
            message : "error while getting room details",
            err : err
        })
    }
}

const updateRooms = async(req,res)=> {

    try{

        const updateDetails = await roomSchema.findByIdAndUpdate(req.params.id,req.body)
        res.status(200).json({
            message : "Rooms updated successfully",
            data : updateDetails
        })

    }catch(err){
        res.status(500).json({
            message : "Error while updating Room",
            err : err
        })
    }
}

const deleteRooms = async(req ,res) => {

    try{

        const deleteDetail = await roomSchema.findByIdAndDelete(req.params.id)
        res.status(200).json({
            data : deleteDetail
        })

    }catch(err){
        res.status(500).json({
            message : "error while deleting Room",
            err : err
        })
    }

}

module.exports = {
    manageRooms,
    getRooms,
    updateRooms,
    deleteRooms
}