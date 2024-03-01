const mongoose = require('mongoose');

const connectToDB = (dbUrl) => {
    mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => {
            console.info('Database connection successful');
        })
        .catch(err => {
            console.error('Database connection error ' + err);
        });
};

module.exports = connectToDB;
