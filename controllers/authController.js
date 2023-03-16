const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { jwt_secret_key } = require('../credentials');
//handle errors
const handleErrors = (err) => {
  console.log('err.code', err.code, typeof err.code);
  console.log(err.errors);
  const errors = {
    email: '',
    password: '',
  };
  if (err.code === 11000) {
    errors.email = 'That email is already registered';
  }
  if (err.message.includes('user validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};
const MAX_AGE = 3 * 24 * 60 * 60;

// json web token is a way of creating a unique cookie value to identify a session
const createToken = (id) => {
  return jwt.sign({ jwtUserId: id }, jwt_secret_key, {
    expiresIn: MAX_AGE,
  });
};

const login_get = (req, res) => {
  res.render('login');
};
const signup_get = (req, res) => {
  res.render('signup');
};
const login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);

    // passing the jwt cookie to browser
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: MAX_AGE * 1000,
    });
    // ---
    res
      .status(201)
      .json({ message: 'Login successful', userId: user._id, ok: true });
  } catch (err) {
    // const errors = handleErrors(err);
    console.log({ err });
    res.status(400).json({ error: err.message });
  }
};
const signup_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id);

    // passing the jwt cookie to browser
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: MAX_AGE * 1000,
    });
    // ---
    res.status(201).json({ user: user._id, ok: true });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

const logout_get = (req, res, next) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
};

module.exports = {
  signup_get,
  signup_post,
  login_get,
  login_post,
  logout_get,
};
