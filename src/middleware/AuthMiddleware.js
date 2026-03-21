const jwt =  require("jsonwebtoken")
const secret =  "secret"

const validateToken = async(req ,res , next) => {

    try{

        const token = req.headers.authorization
        console.log(token);
        
        if(token){

            if(token.startsWith("Bearer ")){

                const tokenValue = token.split(" ")[1]
                // verify token using JWT
                const decodedData = jwt.verify(tokenValue,secret)
                console.log(decodedData);
                next()
            }else{
                res.status(401).json({
                    message : "token is not Bearer token"
                })
            }
        }else{
            res.status(401).json({
                message : "token is not present"
            })
        }

    }catch(err){
        console.log(err);
        res.status(500).json({
            message : "Error while validating token"
        })
    }
}

module.exports = validateToken