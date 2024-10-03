const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Student = require('../models/student.model');
const Tutor = require('../models/tutor.model');
const Parent = require('../models/parent.model');
const User = require('../models/user.model'); // not yet implemented general User model for admin

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret'
};

module.exports = (passport) => {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            try {
                let user = null;

                // Identify user role and load from corresponding model
                if (jwt_payload.role === 'student') {
                    user = await Student.findById(jwt_payload.id);
                } else if (jwt_payload.role === 'tutor') {
                    user = await Tutor.findById(jwt_payload.id);
                } else if (jwt_payload.role === 'parent') {
                    user = await Parent.findById(jwt_payload.id);
                } else {
                    user = await User.findById(jwt_payload.id);
                }

                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            } catch (err) {
                return done(err, false);
            }
        })
    );
};
