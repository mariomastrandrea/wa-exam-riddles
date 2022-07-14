const Joi = require('joi');
const dayjs = require('dayjs');

const getRiddleServiceInstance = require("../services/RiddleService");
const riddleService = getRiddleServiceInstance();

// GET /riddles/filter/:filter
async function getRiddlesByFilter(req, res) {
   try {
      const { filter } = req.params;
      const filters = ['all', 'open', 'closed', 'owned', 'not-owned'];

      // filter must be one of the above 
      if (Joi.string().allow(...filters).required().validate(filter).error) {
         return res.status(400).json({
            error: `Does not exist a '${filter}' filter`
         });
      }

      const userIsAuthenticated = req.isAuthenticated();
      const now = dayjs();    // time reference
      let error, obj, code;

      if (!userIsAuthenticated) {
         ({ error, obj, code } = await riddleService.getRiddlesForNotAuthenticatedUser(filter, now));
      }
      else {
         // *user is authenticated here*
         const userId = req.user.id;
         ({ error, obj, code } = await riddleService.getRiddlesForAuthenticatedUser(userId, filter, now));
      }

      if (error) {
         return res.status(code).json({ error });
      }

      return res.status(code).json(obj);
   }
   catch (error) {
      console.log(error);
      return res.status(500).json({
         error: "Generic error occurred during riddles loading"
      });
   }
}

// GET /riddles/:riddleId/hint/:hintNum
async function getHint(req, res) {
   try {
      // validate URL parameters
      const { riddleId, hintNum } = req.params;

      if (Joi.number().integer().required().validate(riddleId).error) {
         return res.status(422).json({
            error: "Invalid riddle id - it must be an integer number"
         });
      }
      
      if (Joi.number().integer().min(1).max(2).required().validate(hintNum).error) {
         return res.status(422).json({
            error: "Invalid hint number - hint must be between 1 and 2"
         });
      }
      // * validation ok here *
      
      const { error, code, obj } = await riddleService.getHint(riddleId, hintNum);

      if (error) {
         return res.status(code).json({ error });
      }

      return res.status(code).json(obj);
   }
   catch (error) {
      console.log(error);
      return res.status(500).json({
         error: "A generic error occurred during hint loading"
      });
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
      const ownerId = req.user.id;
      const ownerUsername = req.user.username;
      const now = dayjs();    // time reference

      const { error, code } = await riddleService.storeRiddle(question, answer,
         difficulty, duration, hint1, hint2, ownerId, ownerUsername, now);

      if (error) {
         return res.status(code).json({ error });
      }

      // * riddle was successfully created *
      return res.status(code).end();
   }
   catch (error) {
      console.log(error);
      return res.status(500).json({
         error: "A generic error occurred during riddle creation"
      });
   }
}

// POST /riddles/replies
// request body: a json containing 'riddleId'(number) and 'reply'(string)
async function createReply(req, res) {
   try {
      // validate request body
      const schema = Joi.object({
         riddleId: Joi.number().integer().required(),
         reply: Joi.string().required()
      });

      const validationResult = schema.validate(req.body);

      if (validationResult.error) {
         return res.status(422).json({
            error: "Unprocessable reply entity"
         });
      }

      const { riddleId, reply } = req.body;
      const userId = req.user.id;      

      const { error, code, obj } = await riddleService.storeReply(riddleId, userId, reply);

      if (error) {
         return res.status(code).json({ error });
      }

      // * reply was successfully created *
      return res.status(code).json(obj);
   }
   catch (error) {
      console.log(error);
      return res.status(500).json({
         error: "A generic error occurred during reply creation"
      });
   }
}

module.exports = {
   getRiddlesByFilter,
   getHint,
   createRiddle,
   createReply
}
