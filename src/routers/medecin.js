
const express = require('express')
const Secretaire = require('../models/secretaire')
const Medecin = require('../models/medecin')
const auth = require('../middleware/authMedecin')
const router = new express.Router()

router.post('/medecins', async (req, res) => {
  const medecin = new Medecin(req.body)

  try {
    await medecin.save()
    const token = await medecin.generateAuthToken()
    res.status(201).send({ medecin, token })
  } catch (e) {
    res.status(400).send(e)
  }
})

router.post('/medecins/me/secretaire', auth, async (req, res) => {

  const secretaire = new Secretaire({
    ...req.body,
    medecin: req.medecin.id
  })
  try {
    await secretaire.save()
    res.status(201).send({ secretaire })
  } catch (e) {
    res.status(400).send(e)
  }
})

router.get('/medecins/me/secretaires', auth, async (req, res) => {
  const medecin = new Medecin(req.medecin)
  try {
    const secretaires = await Secretaire.find({'medecin':medecin.id})
    res.send(secretaires)
    
  } catch (e) {
    res.status(400).send(e) 
  }
})

router.post('/medecins/login', async (req, res) => {
  try {
    const medecin = await Medecin.findByCredentials(req.body.email, req.body.password)
    const token = await medecin.generateAuthToken()
    res.send({ medecin, token })
  } catch (e) {
    res.status(400).send()
  }
})

router.post('/medecins/logout', auth, async (req, res) => {
  try {
    req.medecin.tokens = req.medecin.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.medecin.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.post('/medecins/logoutAll', auth, async (req, res) => {
  try {
    req.medecin.tokens = []
    await req.medecin.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.get('/medecins/me', auth, async (req, res) => {
  res.send(req.medecin)
})

router.patch('/medecins/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' })
  }

  try {
    updates.forEach((update) => req.medecin[update] = req.body[update])
    await req.medecin.save()
    res.send(req.medecin)
  } catch (e) {
    res.status(400).send(e)
  }
})
router.delete('/medecins/me', auth, async (req, res) => {
  try {
    await req.medecin.remove()
    res.send(req.medecin)
  } catch (e) {
    res.status(500).send()
  }
})

module.exports = router
