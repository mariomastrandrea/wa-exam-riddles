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
         const sqlQuery = `SELECT * 
                           FROM User 
                           WHERE username=?`;

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
               username: row.username
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
}

// export only the factory method to get the singleton instance
module.exports = UserDao.getInstance;

