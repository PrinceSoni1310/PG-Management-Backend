const pgSchema = require("../models/PgModel")

const createPg = async(req ,  res) => {

    try{

        const savedPg = await pgSchema.create(req.body)
        res.status(201).json({
            message : "PG inserted Successfully",
            data : savedPg
        })

    }catch(err){
        res.status(500).json({
            message : "Error while inserting PG",
            err : err
        })
    }
}

const getPgDetails = async(req, res) => {
    try{

        const getPg = await pgSchema.find().populate("ownerId")
        res.status(200).json({
            message : "Fetched Pg details",
            data : getPg
        })

    }catch(err){
        res.status(500).json({
            message : "error while fetching PG Details",
            err : err
        })
    }
}

const updatePg = async(req ,res)=> {
    try{

        const updatePgDetails = await pgSchema.findByIdAndUpdate(req.params.id,req.body)
        res.status(200).json({
            message : "PG details updated successfully",
            data : updatePgDetails
        })

    }catch(err){
        res.status(500).json({
            message : "Error while upadating pg details",
            err : err
        })
    }
}

const deletePg = async(req ,res) => {

    try{

        const deleteDetails = await pgSchema.findByIdAndDelete(req.params.id)
        res.status(200).json({
            message: "Deleted successfully",
            data : deleteDetails
        })

    }catch(err){
        res.status(500).json({
            message : "Error while while deleting pg/pgDetails",
            err: err
        })
    }

}


module.exports = {
    createPg,
    getPgDetails,
    updatePg,
    deletePg
}