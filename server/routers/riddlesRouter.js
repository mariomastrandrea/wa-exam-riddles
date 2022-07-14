const express = require('express');
const router = express.Router();

const { 
   getRiddlesByFilter,
   createRiddle,
   createReply
} = require("../controllers/riddlesController");


const isLoggedIn = (req, res, next) => {
   if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'User not authorized' });
   }
   
   return next();
}

router.get("/filter/:filter", getRiddlesByFilter);
router.post("/", isLoggedIn, createRiddle);
router.post("/replies", isLoggedIn, createReply);


module.exports = router;
