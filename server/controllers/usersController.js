const passport = require('passport');
const getUserDaoInstance = require("../dao/UserDao");
const userDao = getUserDaoInstance();

// GET  /sessions/current
async function getCurrentSession(req, res) {
   if (req.isAuthenticated())
      return res.status(200).json(req.user);
   else
      return res.status(401).json({ err: 'Unauthorized' });
}

// POST  /login
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

// DELETE  /logout
async function logout(req, res) {
   req.logout(() => {
      res.end();
   });
}

// GET  /rankinglist
async function getRankingList(req, res) {
   try {
      const orderedRankList = await userDao.getOrderedRankList();

      const top3scores = orderedRankList.map(user => user.score)   // get only the scores
         .filter((score, index, self) => self.indexOf(score) === index) // remove scores duplicates
         .slice(0, 3);   // get only the top 3 scores

      // get only the users with the top 3 scores
      const top3users = orderedRankList.filter(user => top3scores.includes(user.score))
         .map(user => { // add position to the user
            const position = top3scores.indexOf(user.score) + 1;
            user.position = position;
            return user;
         });

      return res.status(200).json(top3users);
   }
   catch (err) {
      console.log(err);
      return res.status(500).json({ 
         error: "Generic error occurred getting ranking list"
      });
   }
}

module.exports = {
   getCurrentSession,
   login,
   logout,
   getRankingList
};