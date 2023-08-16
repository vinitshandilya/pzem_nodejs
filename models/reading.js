let mongoose = require('mongoose');

// schema
let readingSchema = mongoose.Schema({
    timestamp: {
        type: String,
        required: true
    },
    energyUsage: {
        type: String,
        required: true
    }

});

let Reading = module.exports = mongoose.model('Reading', readingSchema);
