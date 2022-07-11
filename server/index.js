'use strict';

// #region - imports
const express = require('express');
const cors = require("cors");
const morgan = require("morgan");
const usersRouter = require("./routers/usersRouter");
const riddlesRouter = require("./routers/riddlesRouter");

// import User DAO
const getUserDaoInstance = require("./dao/UserDao");
const userDao = getUserDaoInstance();

// Passport-related imports
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
// #endregion - imports

// #region - server app init
const port = 3001;
const app = new express();

// add log (morgan) and json middlewares
app.use(morgan('dev'));
app.use(express.json());

// add cors middleware
app.use(cors({
   origin: 'http://localhost:3000',    // address of the frontend app server 
   optionsSuccessStatus: 200,
   credentials: true
}));
// #endregion - server app init

// #region - Authentication setup
// add express session middleware
app.use(session({
   secret: "this is the secret of Mario Mastrandrea, the author of this app",
   resave: false,
   saveUninitialized: false
}));

// Passport: set up local strategy
passport.use(new LocalStrategy(async function verify(username, password, cb) {
   const user = await userDao.getUser(username, password);

   if (!user)
      return cb(null, false, 'Incorrect username or password');

   return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
   cb(null, user);
});

passport.deserializeUser(function (user, cb) { // this user is id + username + score
   return cb(null, user);
});

// add passport authentication middleware
app.use(passport.authenticate('session'));
// #endregion - Authentication setup

// add routers middlewares, able to manage all the requests
app.use("/api", usersRouter); 
app.use("/api/riddles", riddlesRouter);   

// finally... start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
