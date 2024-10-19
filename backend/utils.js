const jwt = require('jsonwebtoken')

function authenticationToken (req,res,next){
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    //no token, unathorized
    if(!token)
    {
        return res.sendStatus(401)
    }

    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN,(err,user) => {
        //token invalid, forbidden
        if(err) return res.sendStatus(401)
        req.user = user
        next()
    })


}

module.exports = {
    authenticationToken,
}