import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import ErrorBox from '../components/utilities/ErrorBox';
import { useErrorMessage, useSetErrorMessage } from '../context/ErrorMessageContext';
import LoginForm from '../components/LoginForm';
import { useSetUser, useUser } from '../context/UserContext';


// login page component
function LoginPage(props) {
   const { login, getCurrentSession } = props;

   // context
   const errorMessage = useErrorMessage();
   const setErrorMessage = useSetErrorMessage();
   const user = useUser();
   const setUser = useSetUser();

   const navigate = useNavigate();


   useEffect(() => {
      getCurrentSession().then(currentUser => {
         setErrorMessage("");

         if (!currentUser) {
            console.clear();  // to clear the '401 unauthorized' error message
            // user is not authenticated or session expired
            return;
         }

         setUser(currentUser);
         // user is already authenticated -> redirect to home page
         navigate("/");
      });
      // eslint-disable-next-line
   }, []);

   if (user) {
      return <></>;
   }

   return (
      <>
         {errorMessage && <ErrorBox className="mx-5">{errorMessage}</ErrorBox>}

         <Row className="mt-5">
            <Col></Col>

            <Col as="main" xs={8} sm={6} lg={4} xl={3} className='my-2 p-1'>
               <LoginForm login={login} />
            </Col>

            <Col></Col>
         </Row>
      </>
   );
}

export default LoginPage;