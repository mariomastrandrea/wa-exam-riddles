import { Container, Form, Navbar, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { PersonCircle, PatchQuestionFill } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { logout } from '../API';
import { useSetErrorMessage } from '../context/ErrorMessageContext';
import { useSetSuccessMessage } from '../context/SuccessMessageContext';
import { useUser, useSetUser } from '../context/UserContext';


// application navbar component
function RiddlesNavbar(props) {
   const { title, activeFilter } = props;

   // context
   const user = useUser();
   const setUser = useSetUser();
   const setErrorMessage = useSetErrorMessage();
   const setSuccessMessage = useSetSuccessMessage();

   const navigate = useNavigate();

   // callbacks
   function goToHome() {
      setErrorMessage("");
      setSuccessMessage("");
      navigate("/");
   }

   function goToLogin() {
      setErrorMessage("");
      setSuccessMessage("");
      navigate("/login");
   }

   async function handleLogout() {
      setErrorMessage("");
      setSuccessMessage("");

      try {
         // call the right API endpoint to logout
         await logout();

         // logout successfully done
         setUser(undefined); // delete logged in user info from context
         setSuccessMessage("You have successfully logged out");
         setTimeout(() => setSuccessMessage(""), 3000);  // make success message disappear after 3s

         // redirect to home page
         navigate("/");
      }
      catch (err) {
         setErrorMessage("Something went wrong with your request");
      }
   }

   return (
      <Navbar bg="primary" variant="dark" expand="md">
         <Container fluid>
            <Navbar.Toggle />

            <Navbar.Brand className="d-flex align-items-center action-icon-wrapper">
               <PatchQuestionFill color="white" size="1.25em" className="me-2"
                  onClick={activeFilter === 'All' ? () => undefined : () => goToHome()} />

               <OverlayTrigger placement="bottom" overlay={
                  <Tooltip>Go to the homepage</Tooltip>
               }>
                  <span onClick={activeFilter === 'All' ? () => undefined : () => goToHome()}>
                     SolveMyRiddle
                  </span>
               </OverlayTrigger>
            </Navbar.Brand>

            <Navbar.Collapse className="flex-md-grow-0 mb-2 mt-3 my-md-0">
               {title !== undefined ?
                  <Navbar.Brand>{title}</Navbar.Brand> :
                  <Form.Control id="search-box" type="text" placeholder="Search..." />
               }
            </Navbar.Collapse>

            <Navbar.Brand>
               <Button onClick={() => user ? handleLogout() : goToLogin()}
                  title={user ? "do the logout" : "go to login page"}>
                  {user ? "Logout" : "SignIn"}
               </Button>
               <PersonCircle title="see user info" color="white" size="1.6em" className="action-icon" />
            </Navbar.Brand>
         </Container>
      </Navbar>
   );
}

export default RiddlesNavbar;