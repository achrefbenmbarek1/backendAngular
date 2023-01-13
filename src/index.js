const express = require('express')
const cors = require("cors")
require('./db/mongoose')
const medecinRouter = require('./routers/medecin')
const secretaireRouter = require('./routers/secretaire')
const fichePatientRouter = require('./routers/fichePatient')

const app = express()
const port = 4000

app.use(cors())
app.use(express.json())
app.use(medecinRouter)
app.use(secretaireRouter)
app.use(fichePatientRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})


const main = async () => {
    // const task = await Task.findById('5c2e505a3253e18a43e612e6')
    // await task.populate('owner').execPopulate()
    // console.log(task.owner)
    try {
      
    } catch (error) {
      
    }

    const user = await User.findById('5c2e4dcb5eac678a23725b5b')
    await user.populate('tasks').execPopulate()
    console.log(user.tasks)
}

