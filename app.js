const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const port = 3000;
const uri = 'mongodb+srv://tkyskii2004:VUE18jnI670AcrDw@tkyskii777.0fz0ilv.mongodb.net/?retryWrites=true&w=majority&appName=tkyskii777';
const app = express();
const dbName = 'AnalyzeKaggle';
const collectionName = 'passengers';
const Passenger = require('./Passenger');
app.use(express.json);
const PORT = process.env.PORT || 3000;
app.use('/api',router)
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
    });
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




router.post('/passenger/create', async (req, res) => {
    try {
        const { Survived, Pclass, Name, Sex, Age, SiblingsSpousesAboard, ParentsChildrenAboard, Fare, Gender } = req.body;

        // Создаем нового пассажира
        const newPassenger = new Passenger({
            Survived: parseInt(Survived),
            Pclass: parseInt(Pclass),
            Name,
            Sex,
            Age: parseFloat(Age),
            SiblingsSpousesAboard: parseInt(SiblingsSpousesAboard),
            ParentsChildrenAboard: parseInt(ParentsChildrenAboard),
            Fare: parseFloat(Fare),
            Gender: parseInt(Gender)
        });

        // Сохраняем пассажира в базе данных
        const savedPassenger = await newPassenger.save();

        res.status(201).json(savedPassenger); // Отправляем ответ с кодом 201 и созданным пассажиром
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

function processData() {
    const results = [];

    fs.createReadStream('titanic.csv')
        .pipe(csv())
        .on('data', (data) => {
            // Создаем объект пассажира
            const passenger = new Passenger({
                Survived: parseInt(data.Survived),
                Pclass: parseInt(data.Pclass),
                Name: data.Name,
                Sex: data.Sex,
                Age: parseFloat(data.Age),
                SiblingsSpousesAboard: parseInt(data['Siblings/Spouses Aboard']),
                ParentsChildrenAboard: parseInt(data['Parents/Children Aboard']),
                Fare: parseFloat(data.Fare),
                Gender: parseInt(data.Gender)
            });

            results.push(passenger);
        })
        .on('end', () => {
            // Вставляем данные в базу данных
            Passenger.insertMany(results)
                .then(() => {
                    console.log('Data inserted successfully');
                })
                .catch(error => {
                    console.error('Error inserting data:', error);
                })
                .finally(() => {
                    // Закрываем соединение с базой данных после завершения операции
                    mongoose.disconnect();
                });
        });
}
async function runAggregation() {
    try {
        // Запрос по количеству пассажиров по классам
        const results1 = await Passenger.aggregate([
            { $group: { _id: "$Pclass", count: { $sum: 1 } } }
        ]).explain("executionStats");
        console.log("Passengers by class:", results1);

        // Фильтрация и сортировка пассажиров по возрасту
        const results2 = await Passenger.aggregate([
            { $match: { Age: { $gt: 18 } } }, // Фильтрация пассажиров старше 18 лет
            { $sort: { Age: 1 } } // Сортировка по возрасту по возрастанию
        ]).explain("executionStats");
        console.log("Passengers older than 18 sorted by age:", results2);

        // Группировка пассажиров по полу с вычислением среднего возраста
        const results3 = await Passenger.aggregate([
            { $group: { _id: "$Sex", avgAge: { $avg: "$Age" } } }
        ]).explain("executionStats");
        console.log("Average age by sex:", results3);

        // Группировка пассажиров по выживаемости
        const results4 = await Passenger.aggregate([
            { $group: { _id: "$Survived", count: { $sum: 1 } } }
        ]).explain("executionStats");
        console.log("Passengers grouped by survival:", results4);

        // Распределение пассажиров по возрастным группам с помощью бакетирования
        const results5 = await Passenger.aggregate([
            {
                $bucket: {
                    groupBy: "$Age",
                    boundaries: [0, 10, 20, 30, 40, 50, 60, 70, 80],
                    default: "Other",
                    output: { "count": { $sum: 1 } }
                }
            }
        ]).explain("executionStats");
        console.log("Explanation for age distribution of passengers:", results5);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect(); // Всегда закрывайте соединение с базой данных после использования
    }
}

runAggregation();




