const paymentSchema = require("../models/PaymentModel")

const managePayment = async (req ,res) => {

    try{

        const payments = await paymentSchema.create(req.body)
        res.status(201).json({
            message : "payment details saved"
        })

    }catch(err){
        res.status(500).json({
            message : "Error while managing payment",
            err : err
        })
    }
}

const getPayments = async(req,res) => {

    try{

        const getPaymentDetails = await paymentSchema.find()
        res.status(200).json({
            message : "payment details fetched",
            data : getPaymentDetails
        })

    }catch(err){
        res.status(500).json({
            message : "Error while getting payment details",
            err : err
        })
    }
}

const updatePaymentDetails = async(req ,res) => {

    try{

        const updatePayment = await paymentSchema.findByIdAndUpdate(req.params.id,req.body)
        res.status(200).json({
            message : "payment details updated successfully",
            data : updatePayment
        })

    }catch(err){
        res.status(500).json({
            message : "Error while updating payment details",
            err : err
        })
    }
}

const deletePaymentDetails = async(req,res)=> {

    try{

        const deletePayment = await paymentSchema.findByIdAndDelete(req.params.id)
        res.status(200).json({
            message : "payment delete successfully",
            data : deletePayment
        })

    }catch(err){
        res.status(500).json({
            message : "Error while deleting payment",
            err : err
        })
    }
}

module.exports = {
    managePayment,
    getPayments,
    updatePaymentDetails,
    deletePaymentDetails
}