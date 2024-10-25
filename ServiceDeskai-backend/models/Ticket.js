const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    description: { type: String, required: true },
    media: { type: [String], default: [] },
    geolocation: {
        type: {
            type: String,
            enum: ['Point'], // 'Point' para geolocalización
            required: true,
        },
        coordinates: { type: [Number], required: true },
    },
    status: { type: String, default: 'unreviewed' },
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
