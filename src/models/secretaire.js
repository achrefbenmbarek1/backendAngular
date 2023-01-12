
const mongoose = require('mongoose')
const validator = require('validator')
const bycript = require('bcryptjs')
const jwt = require('jsonwebtoken')

const secretaireSchema = new mongoose.Schema({
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
  medecin: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    }
  }]
})


secretaireSchema.virtual('fichePatients', {
  ref: 'FichePatient',
  localField: 'medecin',
  foreignField: 'owner'
})

secretaireSchema.methods.toJSON = function() {
  const secretaire = this
  const secretaireObject = secretaire.toObject()

  delete secretaireObject.password
  delete secretaireObject.tokens

  return secretaireObject
}

secretaireSchema.methods.generateAuthToken = async function() {
  const secretaire = this
  const token = jwt.sign({ _id: secretaire._id.toString() }, 'thisIsMySecretMessage')

  secretaire.tokens = secretaire.tokens.concat({ token })
  await secretaire.save()

  return token
}

secretaireSchema.statics.findByCredentials = async (email, password) => {
  const secretaire = await Secretaire.findOne({ email })

  if (!secretaire) {
    throw new Error('Unable to login')
  }

  const isMatch = await bycript.compare(password, secretaire.password)

  if (!isMatch) {
    throw new Error('Unable to login')
  }

  return secretaire
}

// Hash the plain text password before saving
secretaireSchema.pre('save', async function(next) {
  const secretaire = this

  if (secretaire.isModified('password')) {
    secretaire.password = await bycript.hash(secretaire.password, 8)
  }

  next()
})

const Secretaire = mongoose.model('Secretaire', secretaireSchema)

module.exports = Secretaire
