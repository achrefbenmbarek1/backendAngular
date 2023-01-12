const mongoose = require('mongoose')

const FichePatient = mongoose.model('FichePatient', {
  sex: {
    type: String,
    required: true,
    trim: true,
    enum: ['H', 'F']
  },
  nomPatient: {
    type: String,
    trim: true,
    required: true
  },

  prenomPatient: {
    type: String,
    trim: true,
    required: true
  },

  dateDeNaissance: {
    type: Date,
    trim: true,
    required: true
  },

  numeroDeTelephone: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.length !== 8 || isNaN(value)) {
        return new Error("please enter a valid phone number")
      }
    }
  },

  addresseMail: {
    type: String,
    trim: true,
    default:"",
    validate(value) {
      let isValid = value.toLowerCase().match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
      if (!isValid) {
        return new Error("please enter a valiid email");
      }
    }
  },

  addresse: {
    type: String,
    required: true,
    maxLength: 40
  },

  codePostal: {
    type: String,
    trim: true,
    required: true,
    minLength: 4,
    maxLength: 4
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }


})

module.exports = FichePatient
