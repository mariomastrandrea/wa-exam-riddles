'use strict';

// #region - imports

const express = require('express');
const cors = require("cors");
const morgan = require("morgan");
const usersRouter = require("./routers/usersRouter");
const riddlesRouter = require("./routers/riddlesRouter");

// import User DAO
const getUserDAOInstance = require("./dao/UserDAO");
const userDAO = getUserDAOInstance();

// Passport-related imports
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
// #endregion - imports

// #region - server app init

// init express
const port = 3001;
app = new express();

// use log and json middlewares
app.use(morgan('dev'));
app.use(express.json());

// add cors middleware
const corsOptions = {
   origin: 'http://localhost:3000', // address of the frontend app server 
   optionsSuccessStatus: 200,
   credentials: true
};

app.use(cors(corsOptions));
// #endregion - server app init

// #region - Authentication 

// Passport: set up local strategy
passport.use(new LocalStrategy(async function verify(username, password, cb) {
   const user = await userDAO.getUser(username, password);

   if (!user)
      return cb(null, false, 'Incorrect username or password');

   return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
   cb(null, user);
});

passport.deserializeUser(function (user, cb) { // this user is id + username
   return cb(null, user);
});

// add express session middleware
app.use(session({
   secret: "this is the secret of Mario Mastrandrea, the author of this app",
   resave: false,
   saveUninitialized: false
}));

// add passport authentication middleware
app.use(passport.authenticate('session'));
// #endregion - Authentication

// add routers middlewares
app.use("/api", usersRouter); // ** to be created
app.use("/api/riddles", riddlesRouter);   // ** to be created

// start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
