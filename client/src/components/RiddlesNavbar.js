import { Container, Form, Navbar, Button } from 'react-bootstrap';
import { PersonCircle, PatchQuestionFill } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { logout } from '../API';
import { useUser, useUpdateUser } from '../UserContext';


// application navbar component
function RiddlesNavbar(props) {
   const { 
      title, 
      setErrorMessage, 
      setSuccessMessage,
      activeFilter
   } = props;

   const navigate = useNavigate();
   const user = useUser(); 
   const updateUser = useUpdateUser();

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
         updateUser(undefined); // delete logged in user info from context
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
               <PatchQuestionFill color="white"  size="1.25em" className="me-2" title="go to homepage"
                  onClick={activeFilter === 'All' ? () => undefined : () => goToHome()}/>

               <span title="go to homepage" onClick={activeFilter === 'All' ? () => undefined : () => goToHome()}>
                  SolveMyRiddle
               </span>
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