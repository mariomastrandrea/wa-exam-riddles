import React, { useContext, useState } from 'react';

const ErrorMessageContext = React.createContext(); 
const SetErrorMessageContext = React.createContext();

function useErrorMessage() {
   return useContext(ErrorMessageContext);
}

function useSetErrorMessage() {
   return useContext(SetErrorMessageContext);
}

function ErrorMessageProvider({children}) {
   const [errorMessage, setErrorMessage] = useState();

   return (
      <ErrorMessageContext.Provider value={errorMessage}>
         <SetErrorMessageContext.Provider value={setErrorMessage}>
            {children}
         </SetErrorMessageContext.Provider>
      </ErrorMessageContext.Provider>
   );
}

export { ErrorMessageProvider, useErrorMessage, useSetErrorMessage };