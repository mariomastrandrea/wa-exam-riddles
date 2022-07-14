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
   catch (error) {
      console.log(error);
      throw error;
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
   catch (error) {
      console.log(error);
      throw error;
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
         const errDetails = await response.json();
         throw new TypeError(`${response.statusText}${errDetails ? " - " : ""}${errDetails.error}`);
      }

      const user = await response.json();
      return user;
   }
   catch (error) {
      console.log(error);
      throw error;
   }
}

/* riddles APIs */

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
         const errDetails = await response.json();
         throw new TypeError(`${response.statusText}${errDetails ? " - " : ""}${errDetails.error}`);
      }

      // new riddle added successfully
      return true;
   }
   catch (error) {
      // network connection error
      console.log(error);
      throw error;
   }
}

async function loadRiddlesFilteredBy(filter) {
   try {
      const response = await fetch(`${apiUrl}/riddles/filter/${filter}`, {
         method: 'GET',
         credentials: 'include'
      });

      if (!response.ok) {
         // application error
         const errDetails = await response.json();
         throw new TypeError(`${response.statusText}${errDetails ? " - " : ""}${errDetails.error}`);
      }

      const filteredRiddles = await response.json();

      // ** modify riddles representation where needed **

      const now = dayjs();

      for (let riddle of filteredRiddles) {

         // transform 'deadline' attribute into 'remaining seconds'
         if (riddle.deadline) {  // open riddle, with timer already started
            const remainingSeconds = dayjs(riddle.deadline).diff(now, 'second');

            riddle.remainingSeconds = Math.max(remainingSeconds, 0);
            delete riddle.deadline;
         }
         else if (riddle.deadline === null) {
            riddle.remainingSeconds = riddle.duration; // riddle open but timer not started yet (no one has replied)
            delete riddle.deadline;
         }

         // compute how much time has passed since the riddle was created
         if (riddle.birth) {
            riddle.life = computeTimePassedFrom(dayjs(riddle.birth), now);
            delete riddle.birth;
         }

         // compute how much time has passed since every reply (if any) was created
         if (riddle.replies) {
            for (let reply of riddle.replies) {
               reply.life = computeTimePassedFrom(dayjs(reply.timestamp), now);
               delete reply.timestamp;
            }
         }
      }

      return filteredRiddles;
   }
   catch (error) {
      // network connection error
      console.log(error);
      throw error;
   }
}

async function getHint(riddleId, hintNum) {
   try {
      const response = await fetch(`${apiUrl}/riddles/${riddleId}/hint/${hintNum}`, {
         method: 'GET',
         credentials: 'include'
      });

      if (!response.ok) {
         // application error
         const errDetails = await response.json();
         throw new TypeError(`${response.statusText}${errDetails ? " - " : ""}${errDetails.error}`);
      }

      const hintObj = await response.json();
      return hintObj.hint;
   }
   catch (error) {
      // network connection error
      console.log(error);
      throw error;
   }
}

async function postNewReply(riddleId, reply) {
   try {
      const response = await fetch(`${apiUrl}/riddles/replies`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         credentials: 'include',
         body: JSON.stringify({ riddleId, reply })
      });

      if (!response.ok) {
         // application error
         const errDetails = await response.json();
         throw new TypeError(`${response.statusText}${errDetails ? " - " : ""}${errDetails.error}`);
      }

      const replyOutcome = await response.json();
      return replyOutcome.correct;  // true or false
   }
   catch (error) {
      // network connection error
      console.log(error);
      throw error;
   }
}

/* ranking APIs */

async function loadRankingList() {
   try {
      const response = await fetch(`${apiUrl}/rankinglist`, {
         method: 'GET',
         credentials: 'include'
      });

      if (!response.ok) {
         // application error
         const errDetails = await response.json();
         throw new TypeError(`${response.statusText}${errDetails ? " - " : ""}${errDetails.error}`);
      }

      const rankingList = await response.json();
      return rankingList;
   }
   catch (error) {
      // network connection error
      console.log(error);
      throw error;
   }
}

async function getUserScore(userId) {
   try {
      const response = await fetch(`${apiUrl}/rankinglist/${userId}`, {
         method: 'GET',
         credentials: 'include'
      });

      if (!response.ok) {
         // application error
         const errDetails = await response.json();
         throw new TypeError(`${response.statusText}${errDetails ? " - " : ""}${errDetails.error}`);
      }

      const userScore = await response.json();
      return userScore.score;
   }
   catch (error) {
      // network connection error
      console.log(error);
      throw error;
   }
}


/* auxiliary functions */

// 'startTimestamp' can be either a string or a dayjs object
function computeTimePassedFrom(startTimestamp, now) {
   const minutesPassed = now.diff(startTimestamp, 'minute');

   if (minutesPassed === 0)
      return "now";

   const hoursPassed = now.diff(startTimestamp, 'hour');

   if (hoursPassed === 0)
      return `${minutesPassed} minute${minutesPassed > 1 ? 's' : ''}`;

   const daysPassed = now.diff(startTimestamp, 'day');

   if (daysPassed === 0)
      return `${hoursPassed} hour${hoursPassed > 1 ? 's' : ''}`;

   const monthsPassed = now.diff(startTimestamp, 'month');

   if (monthsPassed === 0)
      return `${daysPassed} day${daysPassed > 1 ? 's' : ''}`;

   const yearsPassed = now.diff(startTimestamp, 'year');

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
   getHint,
   postNewReply,
   loadRankingList,
   getUserScore
};