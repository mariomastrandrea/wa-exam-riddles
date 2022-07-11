import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { loadFilters } from './utilities';
import { UserProvider } from './context/UserContext';
import { ErrorMessageProvider } from './context/ErrorMessageContext';
import { SuccessMessageProvider } from './context/SuccessMessageContext';
import Home from './routes/Home';
import LoginPage from './routes/LoginPage'
import AddRiddlePage from './routes/AddRiddlePage';
import { storeNewRiddle, getRiddlesFilteredBy, login, getCurrentSession } from './API';


function App() {
   // app state
   const [filters, setFilters] = useState([]);  // ** temporary **

   useEffect(() => {
      setFilters(loadFilters());
   }, []);

   async function addRiddle(newRiddle) {  // it can throw an error
      await storeNewRiddle(newRiddle);
      await getRiddlesFilteredBy('all');
      return true;
   }

   return (
      <Router>
         <UserProvider>  { /* provide user context */ }
            <SuccessMessageProvider>  { /* provide successMessage context */ }
               <ErrorMessageProvider>   { /* provide errorMessage context */ }
                  <Container fluid className="vh-100">
                     <Routes>
                        <Route index element={
                           <Home filters={filters} activeFilter={"All"} 
                              getCurrentSession={getCurrentSession} />
                        } />

                        <Route path="/:activeFilter" element={
                           <Home filters={filters} 
                              getCurrentSession={getCurrentSession}/>
                        } />

                        <Route path="/login" element={
                           <LoginPage login={login} 
                              getCurrentSession={getCurrentSession}/>
                        } />

                        <Route path="/addriddle" element={
                           <AddRiddlePage addRiddle={addRiddle} 
                              getCurrentSession={getCurrentSession}/>
                        } />
                     </Routes>
                  </Container>
               </ErrorMessageProvider>
            </SuccessMessageProvider>
         </UserProvider>
      </Router>
   );
}

export default App;

