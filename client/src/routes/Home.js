import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { capitalize } from "../utilities";
import ErrorBox from "../components/utilities/ErrorBox";
import SuccessBox from "../components/utilities/SuccessBox";
import AddButton from "../components/AddButton";
import { useErrorMessage, useSetErrorMessage } from "../context/ErrorMessageContext";
import { useSuccessMessage } from "../context/SuccessMessageContext";
import { useSetUser } from "../context/UserContext";
import RiddlesSidebar from "../components/RiddlesSidebar";
import { loadRiddlesFilteredBy } from "../API";


// home page component
function Home(props) {
   const { filters, getCurrentSession } = props;
   const param = useParams();
   const activeFilter = capitalize(props.activeFilter || param.activeFilter);

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
      })
      .catch(err => {
         setErrorMessage("An error occurred while getting your current session");
      });

      // retrieve riddles data from backend
      loadRiddlesFilteredBy(activeFilter).then(riddles => {
         setRiddles(riddles)
      })
      .catch(err => {
         setErrorMessage("An error occurred while loading riddles");
      });

      // eslint-disable-next-line
   }, [activeFilter]);

   if (filters.length === 0) {
      return <></>;
   }

   // check if the specified filter exist, otherwise return a blank page
   if (!filters.some(filter => filter === activeFilter)) {
      return <ErrorBox>{"Error: please specify an existing filter"}</ErrorBox>;
   }

   return (
      <Row className='h-100'>
         {/* sidebar */}
         <RiddlesSidebar filters={filters} activeFilter={activeFilter} />

         {/* main content */}
         <Col className="col-9">
            <Container fluid>
               <Row className="p-3 pt-4">
                  <h1>{activeFilter}</h1>
               </Row>

               {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
               {successMessage && <SuccessBox>{successMessage}</SuccessBox>}

               <Row as="main" className="px-4">
                  {

                     //<CircularTimer maxSeconds={20} seconds={20} />
                     // riddles list component
                  }
               </Row>

               <Row className="m-1">
                  <AddButton>+</AddButton>
               </Row>
            </Container>
         </Col>
      </Row>
   );
}


export default Home;