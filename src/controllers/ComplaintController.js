const complaintSchema = require ("../models/ComplaintModel")

const manageComplaint = async (req, res) => {

    try { 
        
        const complaint = await complaintSchema.create(req.body)
        res.status(201).json({
            message : "Complaint registered",
            data : complaint
        })

    }catch(err){
        res.status(500).json({
            message : "Error while managing payment",
            err  :err
        })
    }
}

const getAllComplaints = async (req,res)=> {

    try {

        const getComplaints = await complaintSchema.find()
        res.status(200).json({
            message : "Complaint Fetched..",
            data : getComplaints
        })

    }catch (err){
        res.status(500).json({
            message : "Error while getting Complaints",
            err : err
        })
    }
}

const updateComplaintDetails = async(req ,res) => {

    try{

        const updateComplaint = await complaintSchema.findByIdAndUpdate(req.params.id, req.body)
        res.status(500).json({
            message : "Complaint updated successfully",
            data : updateComplaint
        })

    }catch(err){
        res.status(500).json({
            message : "Error while updating complaint",
            err : err
        })
    }
}

const deleteComplaintDetails = async(req , res)=>{

    try{

        const deleteComplaint = await complaintSchema.findByIdAndDelete(req.params.id)
        res.status(200).json({
            message : "Complaint deleted successfully",
            data : deleteComplaint
        })

    }catch(err){
        res.status(500).json({
            message : "Error while deleting Complaint",
            err: err
        })
    }
}

module.exports = {
    manageComplaint,
    getAllComplaints,
    updateComplaintDetails,
    deleteComplaintDetails
}