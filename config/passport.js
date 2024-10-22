const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Student = require('../models/student.model');
const Tutor = require('../models/tutor.model');
const Parent = require('../models/parent.model');
const Admin = require('../models/admin.model');

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret'
};

module.exports = (passport) => {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            try {
                let user = null;
                let Model;

                switch (jwt_payload.role) {
                    case 'student':
                        Model = Student;
                        break;
                    case 'tutor':
                        Model = Tutor;
                        break;
                    case 'parent':
                        Model = Parent;
                        break;
                    case 'admin':
                        Model = Admin;
                        break;
                    default:
                        return done(null, false);
                }

                user = await Model.findById(jwt_payload.id)
                    .select('-password')
                    .exec();

                if (user) {
                    user.role = jwt_payload.role; 
                    return done(null, user);
                }
                return done(null, false);
            } catch (err) {
                return done(err, false);
            }
        })
    );
};
