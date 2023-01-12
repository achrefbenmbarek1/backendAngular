
const jwt = require('jsonwebtoken')
const Medecin = require('../models/medecin')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'thisIsMySecretMessage')
        const medecin = await Medecin.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!medecin) {
            throw new Error()
        }

        req.token = token
        req.medecin = medecin
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth
