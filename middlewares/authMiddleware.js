const jwt = require('jsonwebtoken');
const { jwt_secret_key } = require('../credentials');
const User = require('../models/user');

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) res.redirect('/login');
  jwt.verify(token, jwt_secret_key, (err, decodedToken) => {
    if (err) {
      console.log(err?.message);
      res.redirect('/login');
    } else {
      // Hence, it will go to next middleware ONLY if the jwt cookie is found and correct
      next();
    }
  });
};

const checkUser = async (req, res, next) => {
  const token = req.cookies.jwt;
  res.locals.user = null;
  if (token) {
    await jwt.verify(token, jwt_secret_key, async (err, decodedToken) => {
      if (err) {
        console.log(err?.message);
      } else {
        const user = await User.findById(decodedToken.jwtUserId);
        // res.locals is special b/c properties set in it can be used in views directly
        res.locals.user = user;
      }
    });
  }
  next();
};

module.exports = {
  requireAuth,
  checkUser
};
