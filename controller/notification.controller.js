const Notification = require('../models/notification.model');
const AppError = require('../utils/appError');


exports.getUserNotifications = async (req, res, next) => {
    const notifications = await Notification.find({ recipient: req.user.id })
        .sort('-createdAt')
        .populate('relatedItem');

    res.status(200).json({
        status: 'success',
        results: notifications.length,
        data: { notifications }
    });
};

exports.createNotification = async (req, res, next) => {
    const newNotification = await Notification.create({
        ...req.body,
        recipient: req.body.recipientId
    });

    res.status(201).json({
        status: 'success',
        data: { notification: newNotification }
    });
};

exports.getNotification = async (req, res, next) => {
    const notification = await Notification.findById(req.params.id).populate('relatedItem');

    if (!notification) {
        return next(new AppError('No notification found with that ID', 404));
    }

    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to view this notification', 403));
    }

    res.status(200).json({
        status: 'success',
        data: { notification }
    });
};

exports.markNotificationAsRead = async (req, res, next) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        return next(new AppError('No notification found with that ID', 404));
    }

    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to update this notification', 403));
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
        status: 'success',
        data: { notification }
    });
};

exports.deleteNotification = async (req, res, next) => {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
        return next(new AppError('No notification found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
};