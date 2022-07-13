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

   storeRiddle = async (question, answer, difficulty, duration, hint1, hint2, ownerId, ownerUsername) => {
      // check if a riddle with the same question already exist
      const riddle = await this.#dao.getRiddleByQuestion(question);

      if (riddle) {
         return CONFLICT('A riddle with the same question already exist');
      }

      // * create new riddle *
      const newRiddle = new Riddle(null, question, answer, difficulty,
         duration, hint1, hint2, ownerId, null, ownerUsername);

      const createdRiddle = await this.#dao.store(newRiddle);

      if (!createdRiddle) {
         return INTERNAL_SERVER_ERROR('A generic error occurred during riddle storing');
      }

      return CREATED();
   }

   getRiddlesForNotAuthenticatedUser = async (filter, now) => {
      if (filter === 'owned' || filter === 'not-owned') {
         return UNAUTHORIZED('Not authenticated users does not own riddles');
      }

      let simpleRiddles = await this.#dao.getAllSimpleRiddles();

      // add 'open' and 'owned' fields
      simpleRiddles = simpleRiddles.map(riddle => {
         const open = riddle.deadline ? (now.isSameOrBefore(dayjs(riddle.deadline))) : true;  // if deadline is NULL -> riddle is open

         delete riddle.deadline;

         riddle.open = open;
         riddle.owned = false;
         return riddle;
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
      let riddles = await this.#dao.getAllRiddles();

      // add 'open' and 'owned' fields
      riddles = riddles.map(riddle => {
         const open = riddle.deadline ? (now.isSameOrBefore(dayjs(riddle.deadline))) : true;
         const owned = riddle.ownerId === userId;
         delete riddle.ownerId;

         riddle.open = open;
         riddle.owned = owned;
         return riddle;
      });

      if (filter === 'all') {
         for (let riddle of riddles) {

            // I decided to split the 2x2 combinations in order to keep only 
            // one db call for each one, guaranteeing the atomicity of the query

            if (riddle.open && !riddle.owned) 
               await this.processOpenAndNotOwnedRiddle(riddle, userId);
            
            else if (riddle.open && riddle.owned) 
               await this.processOpenAndOwnedRiddle(riddle);
            
            else if (!riddle.open && riddle.owned) 
               await this.processClosedAndOwnedRiddle(riddle);
            
            else if (!riddle.open && !riddle.owned) 
               await this.processClosedAndNotOwnedRiddle(riddle, userId)
         }

         const processedRiddles = riddles;
         return OK(processedRiddles);
      }

      if (filter === 'open') {
         const filteredRiddles = riddles.filter(riddle => riddle.open);

         for (let riddle of filteredRiddles) {
            if  (riddle.owned) await this.processOpenAndOwnedRiddle(riddle);
            else /*not owned*/ await this.processOpenAndNotOwnedRiddle(riddle, userId);
         }

         return OK(filteredRiddles);
      }

      if (filter === 'closed') {
         const filteredRiddles = riddles.filter(riddle => !riddle.open);

         for (let riddle of filteredRiddles) {
            if  (riddle.owned) await this.processClosedAndOwnedRiddle(riddle);
            else /*not owned*/ await this.processClosedAndNotOwnedRiddle(riddle, userId);
         }

         return OK(filteredRiddles);
      }

      if (filter === 'owned') {
         const filteredRiddles = riddles.filter(riddle => riddle.owned);

         for (let riddle of filteredRiddles) {
            if  (riddle.open) await this.processOpenAndOwnedRiddle(riddle); 
            else /* closed */ await this.processClosedAndOwnedRiddle(riddle);
         }

         return OK(filteredRiddles);
      }

      if (filter === 'not-owned') {
         const filteredRiddles = riddles.filter(riddle => !riddle.owned);

         for (let riddle of filteredRiddles) {
            if  (riddle.open) await this.processOpenAndNotOwnedRiddle(riddle, userId); 
            else /* closed */ await this.processClosedAndNotOwnedRiddle(riddle, userId);
         }

         return OK(filteredRiddles);
      }

      throw new TypeError("unexpected filter in getRiddlesForAuthenticatedUser()");
   }

   /* auxiliary functions */

   processOpenAndNotOwnedRiddle = async (riddle, userId) => {
      delete riddle.answer;   // user must not be aware of an open riddle's answer

      // if user is not the open riddle's owner -> add the user's reply (if any)
      const userReply = await this.#dao.getUserReplyTo(riddle.id, userId);

      if (userReply)
         riddle.userReply = userReply; // string
   }

   processOpenAndOwnedRiddle = async (riddle) => {
      delete riddle.answer;   // user must not be aware of an open riddle's answer

      // if the riddle is open and owned by the user -> add replies
      const riddleReplies = await this.#dao.getAllRepliesTo(riddle.id);
      riddle.replies = riddleReplies;
   }

   processClosedAndOwnedRiddle = async (riddle) => {
      delete riddle.deadline; 
      delete riddle.duration;

      // retrieve the riddle's replies
      const riddleRepliesWithCorrectness = await this.#dao.getAllRepliesWithCorrectnessTo(riddle.id);

      // find (and add) the winner (if any)
      const winnerIndex = riddleRepliesWithCorrectness.findIndex(reply => reply.correct);
      const winner = winnerIndex > 0 ? riddleRepliesWithCorrectness[winnerIndex].username : undefined;

      if (winner)
         riddle.winner = winner;

      // delete the 'correct' attribute from replies and assign them to the riddle
      riddle.replies = riddleRepliesWithCorrectness.map(reply => {
         delete reply.correct;
         return reply;
      });
   }

   processClosedAndNotOwnedRiddle = async (riddle, userId) => {
      delete riddle.deadline; 
      delete riddle.duration;

      // retrieve the riddle's replies
      const riddleRepliesWithUserIdAndCorrectness =
         await this.#dao.getAllRepliesWithUserIdAndCorrectnessTo(riddle.id);

      // find (and add) user's reply (if any)
      const userReplyIndex =
         riddleRepliesWithUserIdAndCorrectness.findIndex(reply => reply.userId === userId);
      const userReply = userReplyIndex > 0 ?
         riddleRepliesWithUserIdAndCorrectness[userReplyIndex].reply : undefined;

      if (userReply)
         riddle.userReply = userReply;

      // find (and add) the winner (if any)
      const winnerIndex = riddleRepliesWithUserIdAndCorrectness.findIndex(reply => reply.correct);
      const winner = winnerIndex > 0 ? riddleRepliesWithUserIdAndCorrectness[winnerIndex].username : undefined;

      if (winner)
         riddle.winner = winner;

      // remove the user's reply from the list,
      // delete the 'userId' and 'correct' attributes from each reply and 
      // assign all those replies to the riddle
      riddle.replies = riddleRepliesWithUserIdAndCorrectness.flatMap(reply => {
         if (reply.userId === userId)
            return [];  // remove user's reply

         delete reply.userId;
         delete reply.correct;
         return [reply];
      });
   }
}




module.exports = RiddleService.getInstance;