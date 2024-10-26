const Notification = require('../models/notification.model');

/**
 * Send a notification to a specific user
 * @param {string} recipient - The ID of the user to receive the notification
 * @param {string} message - The notification message (required)
 * @param {string} type - The type of notification ('Assignment', 'Grade', 'Announcement', 'Other')
 * @param {string} [relatedItem] - Optional ID of related item (assignment, class, course)
 * @param {string} [itemModel] - Model type of related item ('Assignment', 'Class', 'Course')
 * @returns {Promise<void>}
 */
exports.sendNotification = async (recipient, message, type = 'Other', relatedItem = null, itemModel = null) => {
    try {
        await Notification.create({
            recipient,
            message,
            type,
            relatedItem,
            itemModel: relatedItem ? itemModel : undefined,
            read: false
        });
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

/**
 * Send a notification to multiple users
 * @param {string[]} recipients - Array of user IDs to receive the notification
 * @param {string} message - The notification message (required)
 * @param {string} type - The type of notification ('Assignment', 'Grade', 'Announcement', 'Other')
 * @param {string} [relatedItem] - Optional ID of related item (assignment, class, course)
 * @param {string} [itemModel] - Model type of related item ('Assignment', 'Class', 'Course')
 * @returns {Promise<void>}
 */
exports.sendBulkNotifications = async (recipients, message, type = 'Other', relatedItem = null, itemModel = null) => {
    try {
        const notifications = recipients.map(recipient => ({
            recipient,
            message,
            type,
            relatedItem,
            itemModel: relatedItem ? itemModel : undefined,
            read: false
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error sending bulk notifications:', error);
    }
};