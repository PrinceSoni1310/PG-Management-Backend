const noticeSchema = require("../models/NoticeModel")

const manageNotice = async(req,res) => {

    try{

        const addNotice = await noticeSchema.create(req.body)
        res.status(201).json({
            message : "Notice added",
            data : addNotice
        })

    }catch(err){
        res.status(500).json({
            message : "Error while managing notice",
            err : err
        })
    }
}

const getAllNotice = async(req,res) => {

    try{

        const getNotice = await noticeSchema.find()
        res.status(200).json({
            message : "Notice get successfully",
            data : getNotice
        })

    }catch(err){
        res.status(500).json({
            message : "Error while getting Notice"
        })
    }
}

const updateNoticeDetails = async (req,res)=> {

    try{

        const updateNotice = await noticeSchema.findByIdAndUpdate(req.params.id,req.body)
        res.status(200).json({
            message : "notice updated successfully",
            data : updateNotice
        })

    }catch(err){
        res.status(500).json({
            message : "Error while updating notice",
            err : err
        })
    }
}

const deleteNoticeDetails = async (req,res)=> {

    try{

        const deleteNotice = await noticeSchema.findByIdAndDelete(req.params.id)
        res.status(200).json({
            message : "Notice deleted successfully",
            data : deleteNotice
        })

    }catch(err){
        res.status(500).json({
            message : "Error while deleting notice",
            err : err
        })
    }

}

module.exports = {
    manageNotice,
    getAllNotice,
    updateNoticeDetails,
    deleteNoticeDetails
}