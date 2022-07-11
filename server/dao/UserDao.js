const dbConnection = require("./dbUtilities");
const crypto = require('crypto');

class UserDao {
   #db;
   static instance;  // singleton instance

   constructor(dbConnection) {
      this.#db = dbConnection;
   }

   static getInstance() {
      if (!UserDao.instance)
         UserDao.instance = new UserDao(dbConnection);

      return UserDao.instance;
   }

   closeDb() {
      this.#db.close();
   }

   getUser(username, password) {
      return new Promise((resolve, reject) => {
         const sqlQuery = `SELECT U.id AS id, U.username AS username, 
                                  U.salt AS salt, U.hash AS hash, R.score AS score  
                           FROM User U, Rank R
                           WHERE username=? AND U.id=R.userId`;

         this.#db.get(sqlQuery, [username], (err, row) => {
            if (err) {
               console.log(err);
               reject(err);
               return;
            }

            if (!row) {
               resolve(null); // username not found
               return
            }

            // username exists, now check password
            let user = {
               id: row.id, 
               username: row.username,
               score: row.score
            };

            crypto.scrypt(password, row.salt, 32, function (err, hashedPassword) {
               if (err)
                  reject(err);
               else if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword))
                  resolve(null);   // password is not correct -> return null
               else
                  resolve(user);    // username and password are both correct -> return the user object
            });
         });
      });
   }

   getOrderedRankList() {
      return new Promise((resolve, reject) => {
         const sqlQuery = `SELECT U.username AS username, R.score AS score
                           FROM Rank R, User U
                           WHERE R.userId = U.id
                           ORDER BY score DESC, username ASC`;

         this.#db.all(sqlQuery, (err, rows) => {
            if (err) 
               reject(err)
            else 
               resolve(rows.map(row => ({
                  username: row.username,
                  score: row.score
               })));
         });               
      });
   }
}

// export only the factory method to get the singleton instance
module.exports = UserDao.getInstance;

