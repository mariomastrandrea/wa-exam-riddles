const Riddle = require('../models/Riddle');
const getRiddleDaoInstance = require("../dao/RiddleDao");

const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
const dayjs = require('dayjs').extend(isSameOrBefore);

const {
   OK,
   CREATED,
   INTERNAL_SERVER_ERROR,
   CONFLICT,
   UNAUTHORIZED,
   NOT_FOUND,
   BAD_REQUEST
} = require("../statusCodes");

const { int } = require("../utilities");


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

   storeRiddle = async (question, answer, difficulty, duration, hint1, hint2, ownerId, ownerUsername, now) => {7
      // check if a riddle with the same question already exist
      const riddle = await this.#dao.getRiddleByQuestion(question);

      if (riddle) {
         return CONFLICT('A riddle with the same question already exist');
      }

      // * create new riddle *
      const newRiddle = new Riddle(null, question, answer, difficulty,
         duration, hint1, hint2, ownerId, null, ownerUsername, now.toISOString());

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
            if (riddle.owned) await this.processOpenAndOwnedRiddle(riddle);
            else /*not owned*/ await this.processOpenAndNotOwnedRiddle(riddle, userId);
         }

         return OK(filteredRiddles);
      }

      if (filter === 'closed') {
         const filteredRiddles = riddles.filter(riddle => !riddle.open);

         for (let riddle of filteredRiddles) {
            if (riddle.owned) await this.processClosedAndOwnedRiddle(riddle);
            else /*not owned*/ await this.processClosedAndNotOwnedRiddle(riddle, userId);
         }

         return OK(filteredRiddles);
      }

      if (filter === 'owned') {
         const filteredRiddles = riddles.filter(riddle => riddle.owned);

         for (let riddle of filteredRiddles) {
            if (riddle.open) await this.processOpenAndOwnedRiddle(riddle);
            else /* closed */ await this.processClosedAndOwnedRiddle(riddle);
         }

         return OK(filteredRiddles);
      }

      if (filter === 'not-owned') {
         const filteredRiddles = riddles.filter(riddle => !riddle.owned);

         for (let riddle of filteredRiddles) {
            if (riddle.open) await this.processOpenAndNotOwnedRiddle(riddle, userId);
            else /* closed */ await this.processClosedAndNotOwnedRiddle(riddle, userId);
         }

         return OK(filteredRiddles);
      }

      throw new TypeError("unexpected filter in getRiddlesForAuthenticatedUser()");
   }

   getHint = async (riddleId, hintNum) => {
      // check if riddle exists
      const riddle = await this.#dao.getRiddleById(riddleId);

      if(!riddle) {
         return NOT_FOUND(`Does not exist riddle with id=${riddleId}`);
      }

      const now = dayjs();

      // check if no one has still replied to the riddle yet
      if (!riddle.deadline) {
         return BAD_REQUEST('No one has replied to the riddle yet');
      }

      // check if riddle is already closed
      if (now.isAfter(dayjs(riddle.deadline))) {
         return BAD_REQUEST(`Riddle with id=${riddleId} is already closed`);
      }

      // check the remaining time, compared to the requested hint
      let secondsThreshold;
      hintNum = int(hintNum);

      if (hintNum === 1) {
         secondsThreshold = Math.ceil((riddle.duration * 0.5));
      }
      else if (hintNum === 2) {
         secondsThreshold = Math.ceil((riddle.duration * 0.25));
      }

      const remainingSeconds = dayjs(riddle.deadline).diff(now, 'second');

      if (remainingSeconds > secondsThreshold) { 
         return BAD_REQUEST(`You have to wait ${remainingSeconds - secondsThreshold} seconds before requesting the hint #${hintNum}`);
      }

      // * hint can be shown here *
      const hint = await this.#dao.getHint(riddleId, hintNum);

      if (!hint) {
         return INTERNAL_SERVER_ERROR("A general error occurred retrieving the hint");
      }

      return OK({ hint });
   }

   storeReply = async (riddleId, userId, reply) => {
      // check if riddle exists
      const riddle = await this.#dao.getRiddleById(riddleId);

      if (!riddle) {
         return NOT_FOUND(`Does not exist a riddle with id=${riddleId}`);
      }

      // check if the riddle is still open
      let now = dayjs();
      if (riddle.deadline && now.isAfter(riddle.deadline)) {
         return BAD_REQUEST(`The riddle ${riddleId} is already closed`);
      }

      // check if the user has already provided a reply to that riddle
      const previousReplyToRiddle = await this.#dao.getUserReplyTo(riddleId, userId); // string

      if (previousReplyToRiddle) {
         return CONFLICT(`The user ${userId} has already replied to the riddle ${riddleId}`);
      }

      // * store the reply *

      // check if the reply is correct or not
      const replyIsCorrect = riddle.answer.trim().toLowerCase() === reply.trim().toLowerCase();
      
      now = dayjs();
      let newDeadline = undefined;

      if (replyIsCorrect) {
         // change the riddle's deadline to now
         newDeadline = now.toISOString();
      }
      else {   // (reply is not correct)
         // if this is the first (not correct) reply to that riddle, 
         // set its deadline summing the riddle's duration to now
         if (!riddle.deadline) {
            newDeadline = now.add(riddle.duration, 'second').toISOString();
         }
      }

      if (newDeadline) {
         // change deadline
         const changedDeadline = await this.#dao.setDeadlineTo(riddleId, newDeadline);

         if (!changedDeadline) {
            return INTERNAL_SERVER_ERROR('A generic error occurred during reply creation (deadline setting)');
         }
      }

      // create and store the reply obj
      const newReply = {
         riddleId,
         userId,
         reply,
         correct: replyIsCorrect ? 1 : 0,
         timestamp: now.toISOString()
      }

      const newCreatedReply = await this.#dao.storeReply(newReply);

      if (!newCreatedReply) {
         return INTERNAL_SERVER_ERROR('A generic error occurred during reply creation (reply storing)');
      }

      // update user score (if the reply is correct)
      if (replyIsCorrect) {
         let pointsToAdd = 0;

         if (riddle.difficulty === 'easy') pointsToAdd = 1;
         else if (riddle.difficulty === 'average') pointsToAdd = 2;
         else if (riddle.difficulty === 'difficult') pointsToAdd = 3;

         const updatedUserScore = await this.#dao.addUserScore(userId, pointsToAdd);

         if (!updatedUserScore) {
            return INTERNAL_SERVER_ERROR("A generic error occurred during reply creation (user's score updating)");
         }
      }

      // * everything went well here *

      return CREATED({
         correct: replyIsCorrect  // 'true' or 'false'
      });
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
      const userReply = userReplyIndex >= 0 ?
         riddleRepliesWithUserIdAndCorrectness[userReplyIndex].reply : undefined;

      if (userReply)
         riddle.userReply = userReply;

      // find (and add) the winner (if any)
      const winnerIndex = riddleRepliesWithUserIdAndCorrectness.findIndex(reply => reply.correct);
      const winner = winnerIndex >= 0 ? riddleRepliesWithUserIdAndCorrectness[winnerIndex].username : undefined;

      if (winner)
         riddle.winner = winner;

      // delete the 'userId' and 'correct' attributes from each reply and 
      // assign all those replies to the riddle
      riddle.replies = riddleRepliesWithUserIdAndCorrectness.map(reply => {
         delete reply.userId;
         delete reply.correct;
         return reply;
      });
   }
}

module.exports = RiddleService.getInstance;