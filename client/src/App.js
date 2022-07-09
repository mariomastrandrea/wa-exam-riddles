import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Container } from 'react-bootstrap'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import LoginPage from './routes/LoginPage'
import { UserProvider } from './UserContext';


function App() {
   // app state
   const [errorMessage, setErrorMessage] = useState("");
   const [successMessage, setSuccessMessage] = useState("");

   return (
      <Router>
         <UserProvider>
            <Container fluid className="vh-100">
               <Routes>
                  <Route index element={
                     <Home
                     // home attributes
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

