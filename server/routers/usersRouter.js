const express = require('express');
const router = express.Router();

const {
   login,
   logout,
   getCurrentSession,
   getRankingList
} = require("../controllers/usersController");

router.get('/sessions/current', getCurrentSession);
router.get("/rankinglist", getRankingList);
router.post("/login", login);
router.delete("/logout", logout);

module.exports = router;


