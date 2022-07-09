const apiUrl = "http://localhost:3001/api/";

async function login(credentials) {
   try {
      const response = await fetch(`${apiUrl}login`, {
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
      const response = await fetch(`${apiUrl}logout`, {
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
      const response = await fetch(`${apiUrl}sessions/current`, {
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

export {
   login,
   logout,
   getCurrentSession
};