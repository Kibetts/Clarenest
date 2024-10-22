const Message = require('../models/message.model');

exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        const newMessage = new Message({
            sender: req.user.id,
            senderModel: req.user.constructor.modelName,
            recipient: recipientId,
            recipientModel: req.body.recipientModel,
            content
        });
        await newMessage.save();
        res.status(201).json({ message: 'Message sent successfully', data: newMessage });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, senderModel: req.user.constructor.modelName },
                { recipient: req.user.id, recipientModel: req.user.constructor.modelName }
            ]
        }).sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        if (message.recipient.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to mark this message as read' });
        }
        message.read = true;
        await message.save();
        res.json({ message: 'Message marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};