import { useParams } from "react-router";
import { useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { capitalize } from "../utilities";
import ErrorBox from "../components/utilities/ErrorBox";
import SuccessBox from "../components/utilities/SuccessBox";
import AddButton from "../components/AddButton";
import { useErrorMessage } from "../context/ErrorMessageContext";
import { useSuccessMessage } from "../context/SuccessMessageContext";
import { useSetUser } from "../context/UserContext";
import RiddlesSidebar from "../components/RiddlesSidebar";


// home page component
function Home(props) {
   const { filters, getCurrentSession } = props;
   const param = useParams();
   const activeFilter = capitalize(props.activeFilter || param.activeFilter?.toLowerCase());

   // context
   const errorMessage = useErrorMessage();
   //const setErrorMessage = useSetErrorMessage();
   const successMessage = useSuccessMessage();
   const setUser = useSetUser();

   useEffect(() => {
      getCurrentSession().then(user => {
         // **
         if (user) {
            console.log("success");
            setUser(user);
         }
         else {
            console.log("error");
         }
         // ** 
      });

      // retrieve data

      // eslint-disable-next-line
   }, [activeFilter]);

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