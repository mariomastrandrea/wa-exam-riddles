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

   // get all riddles, each with id, question and difficulty and deadline
   getAllSimpleRiddles() {
      return new Promise((resolve, reject) => {
         const sqlQuery = `SELECT id, question, difficulty, deadline
                           FROM Riddle`;
         
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

   getAllRiddlesWithOwnerAndAnswer() {
      return new Promise((resolve, reject) => {
         const sqlQuery = `SELECT id, question, difficulty, deadline, answer, ownerId
                           FROM Riddle`;
         
         this.#db.all(sqlQuery, (err, rows) => {
            if(err) 
               reject(err);
            else
               resolve(rows.map(row => ({
                  id: row.id,
                  question: row.question,
                  difficulty: row.difficulty,
                  deadline: row.deadline,
                  answer: row.answer,
                  ownerId: row.ownerId
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

      return new Promise((resolve, reject) => {
         const sqlStatement = 
            `INSERT INTO Riddle (question, answer, difficulty, duration, hint1, hint2, ownerId, deadline)
             VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`;

         const params = [newQuestion, newAnswer, newDifficulty, newDuration, newHint1, newHint2, newOwnerId];   

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
}

// export only the factory method to get the singleton instance
module.exports = RiddleDao.getInstance;