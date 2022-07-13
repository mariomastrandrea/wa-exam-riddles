const dbConnection = require("./dbUtilities");
const Riddle = require("../models/Riddle");

class RiddleDao {
   #db;
   static instance;  // singleton instance

   constructor(dbConnection) {
      this.#db = dbConnection;
   }

   static getInstance() {
      if (!RiddleDao.instance)
         RiddleDao.instance = new RiddleDao(dbConnection);

      return RiddleDao.instance;
   }

   closeDb() {
      this.#db.close();
   }

   getRiddleByQuestion(question) {
      return new Promise((resolve, reject) => {
         const sqlQuery = `SELECT *
                           FROM Riddle
                           WHERE question=?`;

         this.#db.get(sqlQuery, [question], (err, row) => {
            if (err) 
               reject(err);
            else if (!row) 
               resolve(null);
            else 
               resolve(new Riddle(row.id, row.question, row.answer, row.difficulty,
                  row.duration, row.hint1, row.hint2, row.ownerId, row.deadline));
         });
      });
   }

   // get all riddles, each with id, question, difficulty and deadline, in descending order
   getAllSimpleRiddles() {
      return new Promise((resolve, reject) => {
         const sqlQuery = `SELECT id, question, difficulty, deadline
                           FROM   Riddle
                           ORDER BY id DESC`;
         
         this.#db.all(sqlQuery, (err, rows) => {
            if(err) 
               reject(err);
            else
               resolve(rows.map(row => ({
                  id: row.id,
                  question: row.question,
                  difficulty: row.difficulty,
                  deadline: row.deadline
               })));
         });
      });
   }

   // get all riddles, each with id, question, difficulty, deadline, duration, answer, ownerId, ownerUsername and birth
   getAllRiddles() {
      return new Promise((resolve, reject) => {
         const sqlQuery = `SELECT id, question, difficulty, deadline, duration, answer, ownerId, ownerUsername, birth
                           FROM   Riddle
                           ORDER BY id DESC`;
         
         this.#db.all(sqlQuery, (err, rows) => {
            if(err) 
               reject(err);
            else
               resolve(rows.map(row => ({
                  id: row.id,
                  question: row.question,
                  difficulty: row.difficulty,
                  deadline: row.deadline,
                  duration: row.duration,
                  answer: row.answer,
                  ownerId: row.ownerId,
                  ownerUsername: row.ownerUsername,
                  birth: row.birth
               })));
         });
      });
   }

   store(newRiddle) {
      const newQuestion = newRiddle.question;
      const newAnswer = newRiddle.answer.toLowerCase();
      const newDifficulty = newRiddle.difficulty;
      const newDuration = newRiddle.duration;
      const newHint1 = newRiddle.hint1;
      const newHint2 = newRiddle.hint2;
      const newOwnerId = newRiddle.ownerId;
      const newOwnerUsername = newRiddle.ownerId;

      return new Promise((resolve, reject) => {
         const sqlStatement = 
            `INSERT INTO Riddle (question, answer, difficulty, duration, hint1, hint2, ownerId, deadline, ownerUsername)
             VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`;

         const params = [newQuestion, newAnswer, newDifficulty, newDuration, newHint1, newHint2, newOwnerId, newOwnerUsername];   

         this.#db.run(sqlStatement, params, function(err) {
            if (err) 
               reject(err);
            else if (this.changes === 0) 
               resolve(null);
            else
               resolve(new Riddle(this.lastId, newQuestion, newAnswer, newDifficulty, 
                  newDuration, newHint1, newHint2, newOwnerId, null));
         });
      });
   }

   // replies are chronologically ordered; each one contains (username, reply)
   getAllRepliesTo(riddleId) {   
      return new Promise((resolve, reject) => {
         const sqlQuery = `SELECT U.username AS username, R.reply AS reply
                           FROM   RiddleReply R, User U
                           WHERE  R.userId=U.Id AND R.riddleId=?
                           ORDER  BY R.timestamp ASC`;

         this.#db.all(sqlQuery, [riddleId], (err, rows) => {
            if (err)
               reject(err);
            else
               resolve(rows.map(row => ({
                  username: row.username,
                  reply: row.reply
               })));
         });
      });
   }

   // replies are chronologically ordered; each one contains (username, reply, correct)
   getAllRepliesWithCorrectnessTo(riddleId) {   
      return new Promise((resolve, reject) => {
         const sqlQuery = `SELECT U.username AS username, R.reply AS reply, R.correct AS correct
                           FROM   RiddleReply R, User U
                           WHERE  R.userId=U.Id AND R.riddleId=?
                           ORDER  BY R.timestamp ASC`;

         this.#db.all(sqlQuery, [riddleId], (err, rows) => {
            if (err)
               reject(err);
            else
               resolve(rows.map(row => ({
                  username: row.username,
                  reply: row.reply, 
                  correct: !!row.correct  // 1 -> true, 0 -> false
               })));
         });
      });
   }

   // replies are chronologically ordered; each one contains (userId, username, reply, correct)
   getAllRepliesWithUserIdAndCorrectnessTo(riddleId) {   
      return new Promise((resolve, reject) => {
         const sqlQuery = `SELECT R.userId AS userId, U.username AS username, R.reply AS reply, R.correct AS correct
                           FROM   RiddleReply R, User U
                           WHERE  R.userId=U.Id AND R.riddleId=?
                           ORDER  BY R.timestamp ASC`;

         this.#db.all(sqlQuery, [riddleId], (err, rows) => {
            if (err)
               reject(err);
            else
               resolve(rows.map(row => ({
                  userId: row.userId,
                  username: row.username,
                  reply: row.reply, 
                  correct: !!row.correct  // 1 -> true, 0 -> false
               })));
         });
      });
   }

   // returns only the string representing the user's reply to that riddle (if any)
   getUserReplyTo(riddleId, userId) {
      return new Promise((resolve, reject) => {
         const sqlQuery = `SELECT reply
                           FROM   RiddleReply
                           WHERE  riddleId=? AND userId=?`;

         this.#db.get(sqlQuery, [riddleId, userId], (err, row) => {
            if (err)
               reject(err);
            else if (!row)
               resolve(null);
            else 
               resolve(row.reply);
         });
      });
   }
}

// export only the factory method to get the singleton instance
module.exports = RiddleDao.getInstance;