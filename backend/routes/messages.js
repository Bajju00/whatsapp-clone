const express = require('express');
const router = express.Router();
const Message = require('../models/message');

// GET all unique conversations (users)
router.get('/conversations', async (req, res) => {
    try {
        const conversations = await Message.aggregate([
            { $sort: { timestamp: -1 } },
            {
                $project: {
                    text: 1,
                    timestamp: 1,
                    contact_id: {
                        $cond: {
                            if: { $eq: ["$direction", "inbound"] },
                            then: "$from",
                            else: "$to"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$contact_id",
                    lastMessage: { $first: "$text.body" },
                    lastMessageTimestamp: { $first: "$timestamp" }
                }
            },
            {
                $project: {
                    _id: 0,
                    wa_id: "$_id",
                    name: "$_id",
                    lastMessage: 1,
                    lastMessageTimestamp: 1
                }
            },
            { $sort: { lastMessageTimestamp: -1 } }
        ]);
        res.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: error.message });
    }
});

// GET all messages for a specific conversation
router.get('/conversations/:wa_id', async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ from: req.params.wa_id }, { to: req.params.wa_id }]
        }).sort({ timestamp: 'asc' });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new message (from our frontend)
router.post('/messages', async (req, res) => {
    const { to, text } = req.body;
    const io = req.app.get('socketio');
    const newMessage = new Message({
        messageId: `self_${Date.now()}`,
        from: 'YOUR_BUSINESS_NUMBER', // Replace if needed
        to: to,
        timestamp: new Date(),
        text: { body: text },
        status: 'sent',
        direction: 'outbound'
    });
    try {
        const savedMessage = await newMessage.save();
        io.emit('newMessage', savedMessage);
        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST webhook endpoint for processing WhatsApp payloads
router.post('/webhook', async (req, res) => {
    const payload = req.body;
    const io = req.app.get('socketio');

    try {
        // You can remove the console.log now if you want

        // Check if it's a new message payload
        if (payload.metaData && payload.metaData.entry && payload.metaData.entry[0].changes && payload.metaData.entry[0].changes[0].value.messages) {
            const messageData = payload.metaData.entry[0].changes[0].value.messages[0];
            const metadata = payload.metaData.entry[0].changes[0].value.metadata;

            const newMessage = new Message({
                messageId: messageData.id,
                from: messageData.from,
                to: metadata.display_phone_number,
                timestamp: new Date(parseInt(messageData.timestamp) * 1000),
                text: { body: messageData.text.body },
                direction: 'inbound'
            });
            await newMessage.save();
            io.emit('newMessage', newMessage);
        }

        // Check if it's a status update payload
        if (payload.metaData && payload.metaData.entry && payload.metaData.entry[0].changes && payload.metaData.entry[0].changes[0].value.statuses) {
            const statusData = payload.metaData.entry[0].changes[0].value.statuses[0];
            const updatedMessage = await Message.findOneAndUpdate(
                { messageId: statusData.id },
                { $set: { status: statusData.status } },
                { new: true }
            );
            if (updatedMessage) {
                io.emit('updateStatus', updatedMessage);
            }
        }
        res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).send('ERROR');
    }
});

module.exports = router;