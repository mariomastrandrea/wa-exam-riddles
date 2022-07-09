const sqlite = require('sqlite3').verbose();
const dbSource = './dao/solveMyRiddle.db';

// db connection 
const dbConnection = new sqlite.Database(dbSource, async (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
    }

    //console.log('Connected to the SQLite database.');
});

dbConnection.get("PRAGMA foreign_keys=ON");

module.exports = dbConnection;
