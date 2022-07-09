import React, { useState, useContext } from 'react';

const UserContext = React.createContext();
const UpdateUserContext = React.createContext();

function useUser() {   // user context hook
   return useContext(UserContext);
}

function useUpdateUser() {  // setUser context hook
   return useContext(UpdateUserContext);
}

function UserProvider({children}) { // provider component
   const [user, setUser] = useState();  // logged user context 

   return (
      <UserContext.Provider value={user}>
         <UpdateUserContext.Provider value={setUser}>
            {children}   
         </UpdateUserContext.Provider>
      </UserContext.Provider>
   );
}

export { UserProvider, useUser, useUpdateUser };