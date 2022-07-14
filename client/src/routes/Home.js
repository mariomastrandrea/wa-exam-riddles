import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { loadRiddlesFilteredBy } from "../API";
import { revertFromSnakeCase } from "../utilities";
import { useErrorMessage, useSetErrorMessage } from "../context/ErrorMessageContext";
import { useSuccessMessage } from "../context/SuccessMessageContext";
import { useSetUser } from "../context/UserContext";
import ErrorBox from "../components/utilities/ErrorBox";
import SuccessBox from "../components/utilities/SuccessBox";
import AddButton from "../components/AddButton";
import RiddlesSidebar from "../components/RiddlesSidebar";
import { RiddlesList, RiddlePad } from "../components/RiddlesList";


// home page component
function Home(props) {
   const { filters, getCurrentSession, sendReply } = props;
   const param = useParams();
   const activeFilter = props.activeFilter || param.activeFilter?.toLowerCase();

   // state
   const [riddles, setRiddles] = useState([]);

   // context
   const errorMessage = useErrorMessage();
   const setErrorMessage = useSetErrorMessage();
   const successMessage = useSuccessMessage();
   const setUser = useSetUser();

   useEffect(() => {
      // check if user is logged in
      getCurrentSession().then(user => {
         if (user) {
            setUser(user); // update user's session data
         }
         else {
            console.clear(); // in order to clear the '401 unauthorized' error message
         }
      })
      .catch(err => {
         setErrorMessage("An error occurred while getting your current session");
      });

      // retrieve riddles from the backend at the mounting of the component
      loadRiddlesFilteredBy(activeFilter).then(riddles => {
         setRiddles(riddles);
         setErrorMessage("");
      })
      .catch(err => {
         setErrorMessage("An error occurred while loading riddles");
      });

      // * start the timer to retrieve riddles from backend every 1 sec *
      const timerId = setInterval(() => {
         return;
         loadRiddlesFilteredBy(activeFilter).then(riddles => {
            setRiddles(riddles);
         })
         .catch(err => {
            setErrorMessage("An error occurred while loading riddles");
         });
      }, 1000);

      /* stop the timer when the component is unmounted (es: user changes page/filter) */
      return () => clearInterval(timerId);

      // eslint-disable-next-line
   }, [activeFilter]);

   if (filters.length === 0) {
      return <></>;
   }

   // check if the specified filter exist, otherwise return a blank page
   if (!filters.some(filter => filter === revertFromSnakeCase(activeFilter))) {
      return <ErrorBox>{"Error: please specify an existing filter"}</ErrorBox>;
   }

   return (
      <Row className='home-row'>
         {/* sidebar */}
         <RiddlesSidebar filters={filters} activeFilter={activeFilter} />

         {/* main content */}
         <Col className="col-9 my-1">
            <Container fluid>
               <Row className="px-3 py-4">
                  <h1>{revertFromSnakeCase(activeFilter)} Riddles</h1>
               </Row>

               {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
               {successMessage && <SuccessBox>{successMessage}</SuccessBox>}

               <Row className="riddles-wrapper">
                  {!!riddles && riddles.length > 0 && <RiddlePad id="start" />}
                  <Row as="main" className="px-4 overflow-scroll">
                     {/* riddles list component */}
                     <RiddlesList riddles={riddles} sendReply={sendReply} />
                  </Row>
                  {!!riddles && riddles.length > 0 && <RiddlePad id="end" />}
               </Row>

               {!errorMessage && !successMessage &&
                  <Row className="m-3">
                     <AddButton>+</AddButton>
                  </Row>}
            </Container>
         </Col>
      </Row>
   );
}


export default Home;