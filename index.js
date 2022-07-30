require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const { response } = require('express')
const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :response-time ms :body'))

app.get('/info', (req, res, next) => {
  Person.estimatedDocumentCount()
  .then(result => res.send( `
  <p>Phonebook has info for ${result} people</p>
  <p>${Date()}</p>`))
  .catch(error => next(error))
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id)
    .then(result => {
      res.json(result)
    })
})

/*
app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})
*/

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  
  const person = new Person({
    name: body.name,
    number: body.number,

  })
  console.log(body.id)
  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.put("/api/persons/:id", (request, response, next) => {

  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        const { number } = request.body;
        person.number = number;
        person.save()
          .then(updatedPerson => response.json(updatedPerson))
          .catch(error => next(error));
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
})

/*
app.post('/api/persons', (req, res) => {
  const id = Math.floor(Math.random() * 10000)
  const person = req.body
  person.id = id
  const alreadyExists = persons.some(x => x.name === person.name)
  if (!person.name || !person.number) {
    return res.status(400).json({
      error: 'name or number missing'
    })
  } else if (alreadyExists) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }
  persons = persons.concat(person)
  res.json(person)
})
*/
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message})
  }

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })