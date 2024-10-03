const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { validationResult } = require('express-validator');

const Student = require('../models/student.model');
const Tutor = require('../models/tutor.model');
const Parent = require('../models/parent.model');
const User = require('../models/user.model'); // not yet added general User model (for admin)

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (user, role) => {
    return jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: '1d' });
};

const signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    try {
        let userModel;
        if (role === 'student') {
            userModel = Student;
        } else if (role === 'tutor') {
            userModel = Tutor;
        } else if (role === 'parent') {
            userModel = Parent;
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new userModel({ email, password: hashedPassword });
        const savedUser = await newUser.save();

        const token = generateToken(savedUser, role);
        res.status(201).json({ message: 'User registered successfully', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        let userModel;
        if (role === 'student') {
            userModel = Student;
        } else if (role === 'tutor') {
            userModel = Tutor;
        } else if (role === 'parent') {
            userModel = Parent;
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user, role);
        res.status(200).json({ message: 'Logged in successfully', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const logout = (req, res) => {
    req.logout(); // not yet implemented logout logic
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports={
    signup,
    login,
    logout
}