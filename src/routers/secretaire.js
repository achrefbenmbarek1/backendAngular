const express = require('express')
const Secretaire = require('../models/secretaire')
const auth = require('../middleware/authSecretaire')
const authMedecin = require('../middleware/authMedecin')
const router = new express.Router()

router.post('/secretaires/login', async (req, res) => {
  try {
    const secretaire = await Secretaire.findByCredentials(req.body.email, req.body.password)
    const token = await secretaire.generateAuthToken()
    res.send({ secretaire, token })
  } catch (e) {
    res.status(400).send()
  }
})

router.post('/secretaires/logout', auth, async (req, res) => {
  try {
    req.secretaire.tokens = req.secretaire.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.secretaire.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.post('/secretaires/logoutAll', auth, async (req, res) => {
  try {
    req.secretaire.tokens = []
    await req.secretaire.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.get('/secretaires/me', auth, async (req, res) => {
  res.send(req.secretaire)
})

router.patch('/secretaires/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' })
  }

  try {
    updates.forEach((update) => req.secretaire[update] = req.body[update])
    await req.secretaire.save()
    res.send(req.secretaire)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.delete('/secretaires/me', auth, async (req, res) => {
  try {
    await req.secretaire.remove()
    res.send(req.secretaire)
  } catch (e) {
    res.status(500).send()
  }
})

router.delete('/secretaire/:id', authMedecin, async (req, res) => {
  const _id = req.params.id
  try {
    const secretaire = await Secretaire.findOne({ _id, medecin: req.medecin._id })
    await secretaire.remove()
    res.send(secretaire)
  } catch (e) {
    res.status(500).send()
  }

})
module.exports = router
