import { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useErrorMessage, useSetErrorMessage } from "../context/ErrorMessageContext";
import { useSetUser, useUser } from "../context/UserContext";
import ErrorBox from "../components/utilities/ErrorBox";
import RiddleForm from "../components/RiddleForm";


function AddRiddlePage(props) {
   const { getCurrentSession, addRiddle, getUserScore } = props;

   // context
   const errorMessage = useErrorMessage();
   const setErrorMessage = useSetErrorMessage();
   const user = useUser();
   const setUser = useSetUser();

   const navigate = useNavigate();

   useEffect(() => {
      setErrorMessage("");

      getCurrentSession().then(currentUser => {
         if (!currentUser) {
            console.clear();  // to clear the '401 unauthorized' error message
            // user is not authenticated -> redirect to login page
            navigate("/login");
            return;
         }
         
         getUserScore(currentUser.id).then(newScore => {
            currentUser.score = newScore;
            setUser(currentUser);   // set user context state, in case of page rendering (and state lost)
         })
         .catch(error => {
            setErrorMessage("An error occurred while getting your score");
         });
      });
      // eslint-disable-next-line
   }, []);

   if (!user) {
      return <></>;
   }

   return (
      <>
         {errorMessage && <ErrorBox className="mx-5">{errorMessage}</ErrorBox>}

         <Row className="mt-3">
            <Col></Col>

            <Col as="main" xs={9} sm={6} lg={5} xl={4} className='my-2 p-2'>
               <RiddleForm addRiddle={addRiddle} />
            </Col>

            <Col></Col>
         </Row>
      </>
   );
}

export default AddRiddlePage;