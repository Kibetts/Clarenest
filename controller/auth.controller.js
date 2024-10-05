const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const Student = require('../models/student.model');
const Tutor = require('../models/tutor.model');
const Parent = require('../models/parent.model');
const Admin = require('../models/admin.model');
const { ROLES } = require('../config/roles');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
};

exports.signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;
    
    try {
        let userModel;
        if (role === ROLES.STUDENT) {
            userModel = Student;
        } else if (role === ROLES.TUTOR) {
            userModel = Tutor;
        } else if (role === ROLES.PARENT) {
            userModel = Parent;
        } else if (role === ROLES.ADMIN && req.user.role === ROLES.ADMIN) {
            userModel = Admin;
        } else {
            return res.status(400).json({ message: 'Invalid role or unauthorized role assignment' });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new userModel({ email, password: hashedPassword, role });
        const savedUser = await newUser.save();

        const token = generateToken(savedUser);
        res.status(201).json({ message: 'User registered successfully', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        let userModel;
        if (role === ROLES.STUDENT) {
            userModel = Student;
        } else if (role === ROLES.TUTOR) {
            userModel = Tutor;
        } else if (role === ROLES.PARENT) {
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

        const token = generateToken(user);
        res.status(200).json({ message: 'Logged in successfully', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
