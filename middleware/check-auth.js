const jwt = require("jsonwebtoken");
const Expired_Token = require("../Model/expired_token.model");

module.exports = (req, res, next)=>{
    try{
        const token = req.headers.authorization.split(" ")[1]

        Expired_Token.findOne({expired_token: token})
            .then(expired_token => {
                if (expired_token) {
                    return res.status(401).json({
                        message: "Authorization failed!"
                    })
                } else {
                    const decoded = jwt.verify(token, "secret")
                    req.userData = decoded
                    next()
                }
            })
            .catch(err => {
                return res.status(401).json({
                    message: "Authorization failed!"
                })
            });
    }catch(err){
        return res.status(401).json({
            message: "Authorization failed!"
        });
    }
}

