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
            if (err)
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
            if (err)
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
      const newQuestion = newRiddle.question.trim();
      const newAnswer = newRiddle.answer.trim().toLowerCase();
      const newDifficulty = newRiddle.difficulty;
      const newDuration = newRiddle.duration;
      const newHint1 = newRiddle.hint1.trim();
      const newHint2 = newRiddle.hint2.trim();
      const newOwnerId = newRiddle.ownerId;
      const newOwnerUsername = newRiddle.ownerUsername;
      const newBirth = newRiddle.birth;

      return new Promise((resolve, reject) => {
         const sqlStatement =
            `INSERT INTO Riddle (question, answer, difficulty, duration, hint1, hint2, ownerId, deadline, ownerUsername, birth)
             VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`;

         const params = [newQuestion, newAnswer, newDifficulty, newDuration,
            newHint1, newHint2, newOwnerId, newOwnerUsername, newBirth];

         this.#db.run(sqlStatement, params, function (err) {
            if (err)
               reject(err);
            else if (this.changes === 0)
               resolve(null);
            else
               resolve(new Riddle(this.lastId, newQuestion, newAnswer, newDifficulty,
                  newDuration, newHint1, newHint2, newOwnerId, null, newBirth));
         });
      });
   }

   // replies are chronologically ordered; each one contains (username, reply, timestamp)
   getAllRepliesTo(riddleId) {
      return new Promise((resolve, reject) => {
         const sqlQuery = `SELECT U.username AS username, R.reply AS reply, R.timestamp AS timestamp
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
                  timestamp: row.timestamp
               })));
         });
      });
   }

   // replies are chronologically ordered; each one contains (username, reply, correct, timestamp)
   getAllRepliesWithCorrectnessTo(riddleId) {
      return new Promise((resolve, reject) => {
         const sqlQuery = `SELECT U.username AS username, R.reply AS reply, R.correct AS correct, R.timestamp AS timestamp
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
                  correct: !!row.correct,  // 1 -> true, 0 -> false
                  timestamp: row.timestamp
               })));
         });
      });
   }

   // replies are chronologically ordered; each one contains (userId, username, reply, correct, timestamp)
   getAllRepliesWithUserIdAndCorrectnessTo(riddleId) {
      return new Promise((resolve, reject) => {
         const sqlQuery = `SELECT R.userId AS userId, U.username AS username, R.reply AS reply, R.correct AS correct, R.timestamp AS timestamp
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
                  correct: !!row.correct,  // 1 -> true, 0 -> false
                  timestamp: row.timestamp
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