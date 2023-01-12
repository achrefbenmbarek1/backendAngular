
const jwt = require('jsonwebtoken')
const Secretaire = require('../models/secretaire')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'thisIsMySecretMessage')
        const secretaire = await Secretaire.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!secretaire) {
            throw new Error()
        }

        req.token = token
        req.secretaire = secretaire
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth
