import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import LoginPage from './routes/LoginPage'
import { UserProvider } from './UserContext';
import { loadFilters } from './utilities';


function App() {
   // app state
   const [filters, setFilters] = useState([]);  // ** temporary **
   const [errorMessage, setErrorMessage] = useState("");
   const [successMessage, setSuccessMessage] = useState("");

   useEffect(() => {
      setFilters(loadFilters());
   }, []);

   return (
      <Router>
         <UserProvider>
            <Container fluid className="vh-100">
               <Routes>
                  <Route index element={
                     <Home
                        // home attributes
                        filters={filters}
                        activeFilter={"All"}
                        errorMessage={errorMessage}
                        successMessage={successMessage}
                        setErrorMessage={setErrorMessage}
                        setSuccessMessage={setSuccessMessage}
                     />
                  } />

                  <Route path="/:activeFilter" element={
                     <Home
                        // home attributes
                        filters={filters}
                        errorMessage={errorMessage}
                        successMessage={successMessage}
                        setErrorMessage={setErrorMessage}
                        setSuccessMessage={setSuccessMessage}
                     />
                  } />

                  <Route path="/login" element={
                     <LoginPage
                        // login page attributes
                        errorMessage={errorMessage}
                        successMessage={successMessage}
                        setErrorMessage={setErrorMessage}
                        setSuccessMessage={setSuccessMessage}
                     />
                  } />
               </Routes>
            </Container>
         </UserProvider>
      </Router>
   );
}

export default App;

