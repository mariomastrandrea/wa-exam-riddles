import { useParams } from "react-router";
import { useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import RiddlesNavbar from "../components/RiddlesNavbar";
import { getCurrentSession } from "../API"
import { capitalize } from "../utilities";
import ErrorBox from "../components/utilities/ErrorBox";
import FiltersBox from "../components/FiltersBox";
import SuccessBox from "../components/utilities/SuccessBox";
import AddButton from "../components/AddButton";


// home page component
function Home(props) {
   const param = useParams();

   const {
      errorMessage, setErrorMessage,
      successMessage, setSuccessMessage,
      filters
   } = props;

   const activeFilter = capitalize(props.activeFilter || param.activeFilter?.toLowerCase());

   useEffect(() => {
      getCurrentSession().then(user => {
         // **
         if (user) {
            console.log("success");
         }
         else {
            console.log("error");
         }
      });
      // ** 

      // retrieve data

   }, [activeFilter]);

   let pageContent;

   // check if the specified filter exist, otherwise return a blank page
   if (!filters.some(filter => filter === activeFilter))
      pageContent = <ErrorBox>{"Error: please specify an existing filter"}</ErrorBox>;
   else
      pageContent =
         <Row className='h-100'>
            {/* sidebar */}
            <Col as="aside" className="bg-light col-3 p-4 h-100">
               <FiltersBox className="h-100" filters={filters} active={activeFilter} 
                  setErrorMessage={setErrorMessage} setSuccessMessage={setSuccessMessage} />
            </Col>

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
                        // riddles list component
                     }
                  </Row>

                  <Row className="m-1">
                     <AddButton>+</AddButton>
                  </Row>
               </Container>
            </Col>
         </Row>;

   return (
      <>
         <Row as="header">
            <RiddlesNavbar activeFilter={activeFilter} title="Riddles list"
               setErrorMessage={setErrorMessage} setSuccessMessage={setSuccessMessage} />
         </Row>
         {pageContent}
      </>
   );
}


export default Home;