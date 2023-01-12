const express = require('express')
const FichePatient = require('../models/fichePatient')
const authSecretaire = require('../middleware/authSecretaire')
const authMedecin = require('../middleware/authMedecin')
const router = new express.Router()


router.post('/fichePatients', authSecretaire, async (req, res) => {
    const fichePatient = new FichePatient({
        ...req.body,
        owner: req.secretaire.medecin
    })

    try {
        await fichePatient.save()
        res.status(201).send(fichePatient)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/fichePatients', authSecretaire, async (req, res) => {
    try {
    // await req.medecin.populate('fichePatients').execPopulate()
    const fichePatients = await FichePatient.find({owner:req.secretaire.medecin})
        res.send(fichePatients)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/fichePatients/:id', authSecretaire, async (req, res) => {
    const _id = req.params.id

    try {
        const fichePatient = await FichePatient.findOne({ _id,owner:req.secretaire.medecin})

        if (!fichePatient) {
            return res.status(404).send()
        }

        res.send(fichePatient)
    } catch (e) {
        res.status(500).send()
    }
})
router.get('/fichePatients/medecins/:id',authMedecin,async (req, res) =>{

    const _id = req.params.id

    try {
        const fichePatient = await FichePatient.findOne({ _id,owner:req.medecin._id })

        if (!fichePatient) {
            return res.status(404).send()
        }

        res.send(fichePatient)
    } catch (e) {
        res.status(500).send()
    }
})
router.patch('/fichePatients/:id', authSecretaire, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['numeroDeTelephone', 'addresseMail','addresse','codePostal']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const fichePatient = await FichePatient.findOne({ _id: req.params.id, owner: req.secretaire.medecin})

        if (!fichePatient) {
            return res.status(404).send()
        }

        updates.forEach((update) => fichePatient[update] = req.body[update])
        await fichePatient.save()
        res.send(fichePatient)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/fichePatients/:id', authSecretaire, async (req, res) => {
    try {
    const fichePatient = await FichePatient.findOneAndDelete({ _id: req.params.id, owner: req.secretaire.medecin })
        if (!fichePatient) {
            res.status(404).send()
        }

        res.send(fichePatient)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router
