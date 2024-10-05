const passport = require('passport');
const rateLimit = require('express-rate-limit');

const authenticateJWT = passport.authenticate('jwt', { session: false });

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100 
});

module.exports = {
    authenticateJWT,
    apiLimiter
};
