const Joi = require('joi');
const getRiddleDaoInstance = require("../dao/RiddleDao");
const Riddle = require('../models/Riddle');
const riddleDao = getRiddleDaoInstance();

// GET /riddles/filter/:filter
async function getRiddlesByFilter(req, res) {
   try {
      // TODO
   }
   catch (err) {

   }
}

// POST /riddles
// request body: a json containing 'question'(string), 'answer'(string), 
// 'difficulty'(string between 'easy', 'average' and 'difficult'), 
// 'duration' (number between 30 and 600), 'hint1'(string) and 'hint2'(string)
async function createRiddle(req, res) {
   try {
      // validate request body
      const schema = Joi.object({
         question: Joi.string().required(),
         answer: Joi.string().required(),
         difficulty: Joi.string().valid('easy', 'average', 'difficult').required(),
         duration: Joi.number().integer().min(30).max(600).required(),
         hint1: Joi.string().required(),
         hint2: Joi.string().required()
      });

      const validationResult = schema.validate(req.body);

      if (validationResult.error) {
         return res.status(422).json({
            error: "Unprocessable riddle entity"
         });
      }

      const { question, answer, difficulty, duration, hint1, hint2 } = req.body;

      // check if a riddle with the same question already exist
      const riddle = await riddleDao.getRiddleByQuestion(question);

      if (riddle) {
         return res.status(409).json({
            error: 'A riddle with the same question already exist'
         });
      }

      // * create riddle *
      const ownerId = req.user.id;
      const newRiddle = new Riddle(null, question, answer, difficulty, 
                                    duration, hint1, hint2, ownerId, null);

      const createdRiddle = await riddleDao.store(newRiddle);

      if (!createdRiddle) {   
         throw new TypeError('A generic error occurred during riddle storing');
      }

      // * riddle was successfully created *
      return res.status(201).end();
   }
   catch (err) {
      console.log(err);
      return res.status(500).json({
         error: "Generic error occurred during riddle creation"
      });
   }
}

module.exports = {
   getRiddlesByFilter,
   createRiddle
}
