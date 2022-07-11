const apiUrl = "http://localhost:3001/api";

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

      if(response.status === 401)  
         return null;   // wrong username or password
      
      if(!response.ok) {
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

      if(!response.ok) {
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

      if(response.status === 401)   
         return null;   // no current session
      
      if(!response.ok) {
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

      if(!response.ok) {
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
      const response = await fetch(`${apiUrl}/riddles/filter/${filter.toLowerCase()}`, {
         method: 'GET',
         credentials: 'include'
      });

      if(!response.ok) {
         // application error
         const errDetails = await response.text();
         throw new TypeError(`${response.statusText}${errDetails ? " - " : ""}${errDetails}`);
      }

      const filteredRiddles = await response.json();
      return filteredRiddles; // ** TODO: modify riddles representation where needed **
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

      if(!response.ok) {
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

export {
   login,
   logout,
   getCurrentSession,
   storeNewRiddle,
   loadRiddlesFilteredBy,
   loadRankingList
};