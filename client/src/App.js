import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useState, useEffect } from 'react';
import { Container, Row } from 'react-bootstrap'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { storeNewRiddle, login, logout, getCurrentSession, loadRankingList, postNewReply } from './API';
import { loadFilters } from './utilities';
import { UserProvider } from './context/UserContext';
import { ErrorMessageProvider } from './context/ErrorMessageContext';
import { SuccessMessageProvider } from './context/SuccessMessageContext';
import Home from './routes/Home';
import LoginPage from './routes/LoginPage'
import AddRiddlePage from './routes/AddRiddlePage';
import RankingPage from './routes/RankingPage';
import RiddlesNavbar from './components/RiddlesNavbar';


function App() {
   // app state
   const [filters, setFilters] = useState([]);  // ** temporary **

   useEffect(() => {
      setFilters(loadFilters());
   }, []);

   async function addRiddle(newRiddle) {  // it can throw an error
      const added = await storeNewRiddle(newRiddle);

      if (!added) 
         return false;

      //await loadFilmsFilteredBy('all');
      return true;
   }

   async function getRankingList() {
      const rankingList = await loadRankingList();
      return rankingList;
   }

   async function sendReply(riddleId, reply) {
      const isCorrect = await postNewReply(riddleId, reply);
      return isCorrect;
   }

   return (
      <Router>
         <UserProvider>  { /* provide user context */}
            <SuccessMessageProvider>  { /* provide successMessage context */}
               <ErrorMessageProvider>   { /* provide errorMessage context */}
                  <Container fluid className="vh-100">
                     <Row as="header">
                        <RiddlesNavbar logout={logout} />
                     </Row>

                     <Routes>
                        <Route index element={
                           <Home filters={filters} activeFilter={"all"}
                              getCurrentSession={getCurrentSession} sendReply={sendReply} />
                        } />

                        <Route path="/:activeFilter" element={
                           <Home filters={filters}
                              getCurrentSession={getCurrentSession} sendReply={sendReply} />
                        } />

                        <Route path="/login" element={
                           <LoginPage login={login}
                              getCurrentSession={getCurrentSession} />
                        } />

                        <Route path="/addriddle" element={
                           <AddRiddlePage addRiddle={addRiddle}
                              getCurrentSession={getCurrentSession} />
                        } />

                        <Route path="/ranking" element={
                           <RankingPage getRankingList={getRankingList} getCurrentSession={getCurrentSession} />
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

