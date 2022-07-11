const Riddle = require('../models/Riddle');
var isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
const dayjs = require('dayjs').extend(isSameOrBefore);
const getRiddleDaoInstance = require("../dao/RiddleDao");

const {
   OK,
   CREATED,
   INTERNAL_SERVER_ERROR,
   CONFLICT,
   UNAUTHORIZED
} = require("../statusCodes");


class RiddleService {
   #dao;
   static instance;

   constructor(dao) {
      this.#dao = dao;
   }

   static getInstance() {
      if (!RiddleService.instance)
         RiddleService.instance = new RiddleService(getRiddleDaoInstance());

      return RiddleService.instance;
   }

   storeRiddle = async (question, answer, difficulty, duration, hint1, hint2, ownerId) => {
      // check if a riddle with the same question already exist
      const riddle = await this.#dao.getRiddleByQuestion(question);

      if (riddle) {
         return CONFLICT('A riddle with the same question already exist');
      }

      // * create new riddle *
      const newRiddle = new Riddle(null, question, answer, difficulty,
         duration, hint1, hint2, ownerId, null);

      const createdRiddle = await this.#dao.store(newRiddle);

      if (!createdRiddle) {
         return INTERNAL_SERVER_ERROR('A generic error occurred during riddle storing');
      }

      return CREATED();
   }

   getRiddlesForNotAuthenticatedUser = async (filter, now) => {
      if (filter === 'owned') {  
         return UNAUTHORIZED('Not authenticated users does not own riddles');
      }

      let simpleRiddles = await this.#dao.getAllSimpleRiddles();

      // add 'open' and 'owned' fields
      simpleRiddles = simpleRiddles.map(riddle => {
         const open = riddle.deadline ? (now.isSameOrBefore(dayjs(riddle.deadline))) : true;  // if deadline is NULL -> riddle is open
         return ({ ...riddle, open, owned: false });
      });

      if (filter === 'all') {
         return OK(simpleRiddles);
      }

      if (filter === 'open') {
         return OK(simpleRiddles.filter(riddle => riddle.open));
      }

      if (filter === 'closed') {
         return OK(simpleRiddles.filter(riddle => !riddle.open));
      }

      throw new TypeError("unexpected filter in getRiddlesForNotAuthenticatedUser()");
   }

   getRiddlesForAuthenticatedUser = async (userId, filter, now) => {
      let riddlesWithOwnerAndAnswer = await this.#dao.getAllRiddlesWithOwnerAndAnswer();

      // add 'open' and 'owned' fields
      riddlesWithOwnerAndAnswer = riddlesWithOwnerAndAnswer.map(riddle => {
         const open = riddle.deadline ? (now.isSameOrBefore(dayjs(riddle.deadline))) : true;
         const owned = riddle.ownerId === userId;
      });

      

   } 
}



module.exports = RiddleService.getInstance;