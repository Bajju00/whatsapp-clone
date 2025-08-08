const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    messageId: { type: String, unique: true, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    timestamp: { type: Date, required: true },
    text: {
        body: { type: String, required: true }
    },
    type: { type: String, default: 'text' },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    direction: {
        type: String,
        enum: ['inbound', 'outbound'],
        required: true
    }
});

messageSchema.index({ to: 1, from: 1, timestamp: -1 });

module.exports = mongoose.model('ProcessedMessage', messageSchema, 'processed_messages');