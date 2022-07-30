const mongoose = require('mongoose')
/*
if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
}
*/

const password = process.argv[2]

const url = `mongodb+srv://lempea_pmc:password@cluster0.km161.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
})

if (process.argv.length>4) {
    person.save().then(result => {
        console.log(`added ${process.argv[3]} ${process.argv[4]} to phonebook`)
        mongoose.connection.close()
    })
} else if (process.argv.length<4) {
    Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(persons => {
            console.log(persons.name, persons.number)
        })
        mongoose.connection.close()
    })
}