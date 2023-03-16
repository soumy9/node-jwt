const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const app = express();
const { requireAuth, checkUser } = require('./middlewares/authMiddleware');
const cookieParser = require('cookie-parser');
const { mongoDbCredentials } = require('./credentials');

// Setting up cookie parser
app.use(cookieParser());
// ---

// middleware
app.use(express.static('public'));

// be able to parse client json data
app.use(express.json());
// ---------------------------------

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = `mongodb+srv://${mongoDbCredentials.username}:${mongoDbCredentials.password}@cluster0.9qx3wuh.mongodb.net/node-auth?retryWrites=true&w=majority`;

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));

// routes
// apply this middleware to all get requests
app.get('*', checkUser);
// ---
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', requireAuth, (req, res) => res.render('smoothies'));
app.use(authRoutes);