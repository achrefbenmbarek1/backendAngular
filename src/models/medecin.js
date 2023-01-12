
const mongoose = require('mongoose')
const validator = require('validator')
const bycript = require('bcryptjs')
const jwt = require('jsonwebtoken')
const FichePatient = require('./fichePatient')
const Secretaire = require('./secretaire')

const medecinSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid')
      }
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain "password"')
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a postive number')
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    }
  }]
})


medecinSchema.virtual('fichePatients',{
  ref:'FichePatient',
  localField: '_id',
  foreignField: 'owner'
})
// medecinSchema.virtual('secretaires',{
//   ref:'Secretaire',
//   foreignField: 'medecin',
//   localField: '_id'
// })

medecinSchema.methods.toJSON = function() {
  const medecin = this
  const medecinObject = medecin.toObject()

  delete medecinObject.password
  delete medecinObject.tokens

  return medecinObject
}

medecinSchema.methods.generateAuthToken = async function() {
  const medecin = this
  const token = jwt.sign({ _id: medecin._id.toString() }, 'thisIsMySecretMessage')

  medecin.tokens = medecin.tokens.concat({ token })
  await medecin.save()

  return token
}

medecinSchema.statics.findByCredentials = async (email, password) => {
  const medecin = await Medecin.findOne({ email })

  if (!medecin) {
    throw new Error('Unable to login')
  }

  const isMatch = await bycript.compare(password, medecin.password)

  if (!isMatch) {
    throw new Error('Unable to login')
  }

  return medecin
}

// Hash the plain text password before saving
medecinSchema.pre('save', async function(next) {
  const medecin = this

  if (medecin.isModified('password')) {
    medecin.password = await bycript.hash(medecin.password, 8)
  }

  next()
})

// Delete medecin tasks when medecin is removed
medecinSchema.pre('remove', async function(next) {
  const medecin = this
  await Secretaire.deleteMany({ medecin: medecin._id })
  await FichePatient.deleteMany({ owner: medecin._id })
  next()
})

const Medecin = mongoose.model('Medecin', medecinSchema)

module.exports = Medecin
