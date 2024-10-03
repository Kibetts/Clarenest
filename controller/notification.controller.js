const Notification = require('../models/notification.model');

const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().populate('recipient');
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id).populate('recipient');
        if (!notification) 
            return res.status(404).json({ message: 'Notification not found' });
        res.status(200).json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createNotification = async (req, res) => {
    const { message, recipientId } = req.body;
    try {
        const newNotification = new Notification({ message, recipient: recipientId });
        const savedNotification = await newNotification.save();
        res.status(201).json(savedNotification);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const updateNotification = async (req, res) => {
    try {
        const updatedNotification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedNotification) 
            return res.status(404).json({ message: 'Notification not found' });
        res.status(200).json({message:'notification updated successfully'});
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const deletedNotification = await Notification.findByIdAndDelete(req.params.id);
        if (!deletedNotification) 
            return res.status(404).json({ message: 'Notification not found' });
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports={
    getAllNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification
}