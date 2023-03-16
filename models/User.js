const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, `Minimum password length is ${6} characters`],
  },
});

/*
  The password will not be saved in the DB as it is. It is hashed using a 3rd party library 'bcrypt'.
  Also, the password is appended with a salt, AND THEN hashed.
*/
async function generateHashedPassword(password) {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
}

userSchema.pre('save', async function (next) {
  console.log('New user created and saved', this);
  this.password = await generateHashedPassword(this.password);
  next();
});

// static method to login user
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email: email });
  if (!user) {
    throw new Error('Incorrect email');
  }
  // Note that salt is not passed, bcrypt keeps the salt
  const auth = await bcrypt.compare(password, user.password);
  if (!auth) {
    throw new Error('Incorrect password');
  }
  return user;
};

const User = mongoose.model('user', userSchema);

module.exports = User;
