import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Form, Row, Button } from 'react-bootstrap';
import { useUpdateUser } from '../UserContext';
import { getCurrentSession, login } from '../API';
import RiddlesNavbar from '../components/RiddlesNavbar';
import SuccessBox from '../components/utilities/SuccessBox';
import ErrorBox from '../components/utilities/ErrorBox';


// login page component
function LoginPage(props) {
   const {
      errorMessage,
      successMessage,
      setErrorMessage,
      setSuccessMessage
   } = props;

   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const navigate = useNavigate();
   const updateUser = useUpdateUser();

   useEffect(() => {
      getCurrentSession().then(user => {
         if (!user) {
            // user is not authenticated or session expired
            return;
         }
         // user is already authenticated -> redirect to home page
         navigate("/");
      });
      // eslint-disable-next-line
   }, []);

   async function handleSubmit(event) {
      event.preventDefault();

      setErrorMessage("");
      setSuccessMessage("");

      try {
         const user = await login({
            username: username,
            password: password
         });

         if (!user) {
            setErrorMessage("Incorrect username or password. Please try again");
            return;
         }

         // login was successful
         updateUser(user);  // update user context
         setSuccessMessage(`Welcome ${user.username}!`);
         navigate("/");
      }
      catch (err) {
         setErrorMessage("Something went wrong with your login. Please try again");
         return;
      }
   }

   const headerContent =
      <Row as="header">
         <RiddlesNavbar title="Login" setErrorMessage={setErrorMessage}
            setSuccessMessage={setSuccessMessage} />
      </Row>

   const formContent =
      <Row className="mt-5">
         <Col></Col>
         <Col as="main" xs={8} sm={6} lg={5} xl={4} className='my-2 p-1 login-form'>
            <div style={{
               borderColor: 'grey', borderWidth: 2, borderStyle: 'dotted',
               borderRadius: 10, padding: '0.5em 1.75em'
            }}>
               <Form onSubmit={handleSubmit}>
                  <Form.Group className='my-3'>
                     <Form.Label>Username</Form.Label>
                     <Form.Control type="text" value={username} required={true} placeholder={"username"}
                        onChange={event => setUsername(event.target.value)} />
                  </Form.Group>

                  <Form.Group className='my-3'>
                     <Form.Label>Password</Form.Label>
                     <Form.Control type="password" value={password} required={true} placeholder={"password"}
                        onChange={event => setPassword(event.target.value)} />
                  </Form.Group>

                  <Form.Group className='my-4' align="center">
                     <Button variant='outline-success' type="submit" className="mt-1">Login</Button>
                  </Form.Group>
               </Form>
            </div>
         </Col>
         <Col></Col>
      </Row>;

return (
   <>
      {headerContent}
      {successMessage && <SuccessBox>{successMessage}</SuccessBox>}
      {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
      {formContent}
   </>
);
}

export default LoginPage;