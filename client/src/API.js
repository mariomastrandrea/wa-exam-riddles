const apiUrl = "http://localhost:3001/api";
const dayjs = require("dayjs");

/* user auth */
async function login(credentials) {
   try {
      const response = await fetch(`${apiUrl}/login`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(credentials),
         credentials: 'include'
      });

      if (response.status === 401)
         return null;   // wrong username or password

      if (!response.ok) {
         const errDetails = await response.text();
         throw new TypeError(`${response.statusText}${errDetails ? " - " : ""}${errDetails}`);
      }

      const user = await response.json();
      return user;
   }
   catch (err) {
      console.log(err);
      throw err;
   }
}

async function logout() {
   try {
      const response = await fetch(`${apiUrl}/logout`, {
         method: 'DELETE',
         credentials: 'include'
      });

      if (!response.ok) {
         const errDetails = await response.text();
         throw new TypeError(`${response.statusText}${errDetails ? " - " : ""}${errDetails}`);
      }

      return true;
   }
   catch (err) {
      console.log(err);
      throw err;
   }
}

async function getCurrentSession() {
   try {
      const response = await fetch(`${apiUrl}/sessions/current`, {
         credentials: 'include'
      });

      if (response.status === 401)
         return null;   // no current session

      if (!response.ok) {
         const errDetails = await response.text();
         throw new TypeError(`${response.statusText}${errDetails ? " - " : ""}${errDetails}`);
      }

      const user = await response.json();
      return user;
   }
   catch (err) {
      console.log(err);
      throw err;
   }
}

async function storeNewRiddle(newRiddle) {
   try {
      const response = await fetch(`${apiUrl}/riddles`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         credentials: 'include',
         body: JSON.stringify(newRiddle)
      });

      if (response.status === 409) {
         // already exist a riddle with the same question
         return false;
      }

      if (!response.ok) {
         // application error
         const errDetails = await response.text();
         throw new TypeError(`${response.statusText}${errDetails ? " - " : ""}${errDetails}`);
      }

      // new riddle added successfully
      return true;
   }
   catch (err) {
      // network connection error
      console.log(err);
      throw err;
   }
}

// TODO: implement backend and check
async function loadRiddlesFilteredBy(filter) {
   try {
      const response = await fetch(`${apiUrl}/riddles/filter/${filter}`, {
         method: 'GET',
         credentials: 'include'
      });

      if (!response.ok) {
         // application error
         const errDetails = await response.text();
         throw new TypeError(`${response.statusText}${errDetails ? " - " : ""}${errDetails}`);
      }

      const filteredRiddles = await response.json();

      // ** modify riddles representation where needed **

      // transform 'deadline' field into 'remaining seconds'
      const now = dayjs();

      for (let riddle of filteredRiddles) {
         if (riddle.deadline) {  // open riddle, with timer already started
            const remainingSeconds = dayjs(riddle.deadline).diff(now, 'second');

            riddle.remainingSeconds = Math.max(remainingSeconds, 0);
            delete riddle.deadline;
         }
         else if (riddle.deadline === null) {
            riddle.remainingSeconds = riddle.duration; // riddle open but timer not started yet (no one has replied)
            delete riddle.deadline;
         }

         if (riddle.birth) {
            riddle.life = computeRiddleLife(now, riddle.birth);
            delete riddle.birth;
         }
      }

      return filteredRiddles;
   }
   catch (err) {
      // network connection error
      console.log(err);
      throw err;
   }
}

async function loadRankingList() {
   try {
      const response = await fetch(`${apiUrl}/rankinglist`, {
         method: 'GET',
         credentials: 'include'
      });

      if (!response.ok) {
         // application error
         const errDetails = await response.text();
         throw new TypeError(`${response.statusText}${errDetails ? " - " : ""}${errDetails}`);
      }

      const rankingList = await response.json();
      return rankingList;
   }
   catch (err) {
      // network connection error
      console.log(err);
      throw err;
   }
}

/* auxiliary functions */

function computeRiddleLife(now, birth) {
   const minutesPassed = now.diff(birth, 'minute');

   if (minutesPassed === 0) 
      return "now";

   const hoursPassed = now.diff(birth, 'hour');

   if (hoursPassed === 0) 
      return `${minutesPassed} minute${minutesPassed > 1 ? 's' : ''}`;

   const daysPassed = now.diff(birth, 'day');

   if (daysPassed === 0) 
      return `${hoursPassed} hour${hoursPassed > 1 ? 's' : ''}`;

   const monthsPassed = now.diff(birth, 'month');

   if (monthsPassed === 0) 
      return `${daysPassed} day${daysPassed > 1 ? 's' : ''}`;

   const yearsPassed = now.diff(birth, 'year');

   if (yearsPassed === 0) 
      return `${monthsPassed} month${monthsPassed > 1 ? 's' : ''}`;

   return `${yearsPassed} year${yearsPassed > 1 ? 's' : ''}`;
}

export {
   login,
   logout,
   getCurrentSession,
   storeNewRiddle,
   loadRiddlesFilteredBy,
   loadRankingList
};