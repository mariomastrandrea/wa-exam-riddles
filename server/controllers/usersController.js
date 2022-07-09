const passport = require('passport');

// GET /sessions/current
async function getCurrentSession(req, res) {
   if (req.isAuthenticated())
      return res.status(200).json(req.user);
   else
      return res.status(401).json({ err: 'Unauthorized' });
}

// POST /login
async function login(req, res, next) {
   passport.authenticate('local', (err, user, info) => {
      if (err)
         return next(err);

      if (!user) {
         // display wrong login messages
         return res.status(401).send(info);
      }
      // success, perform the login
      req.login(user, (err) => {
         if (err)
            return next(err);

         // req.user contains the authenticated user, we send all the user info back
         return res.status(201).json(req.user);
      });
   })(req, res, next);
}

// DELETE /logout
async function logout(req, res) {
   req.logout(() => {
      res.end();
   });
}

module.exports = {
   getCurrentSession,
   login,
   logout
};