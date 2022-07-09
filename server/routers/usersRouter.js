const express = require('express');
const router = express.Router();

const {
   login,
   logout,
   getCurrentSession
} = require("../controllers/usersController");

router.get('/sessions/current', getCurrentSession);
router.post("/login", login);
router.delete("/logout", logout);

module.exports = router;


