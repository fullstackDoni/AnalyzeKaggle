const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
    Survived: Number,
    Pclass: Number,
    Name: String,
    Sex: String,
    Age: Number,
    SiblingsSpousesAboard: Number, // Изменим название поля, так как оно содержит слэш
    ParentsChildrenAboard: Number, // Изменим название поля, так как оно содержит слэш
    Fare: Number,
    Gender: String
});

const Passenger = mongoose.model('Passenger', passengerSchema);

module.exports = Passenger;
