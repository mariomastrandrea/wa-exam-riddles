import { Container, Navbar, Button, OverlayTrigger, Tooltip, Stack } from 'react-bootstrap';
import { PersonCircle, PatchQuestionFill, Incognito } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { useSetErrorMessage } from '../context/ErrorMessageContext';
import { useSetSuccessMessage } from '../context/SuccessMessageContext';
import { useUser, useSetUser } from '../context/UserContext';


// application navbar component
function RiddlesNavbar(props) {
   const { logout } = props;

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
         navigate('/');
      }
      catch (err) {
         setErrorMessage("Something went wrong with your request");
      }
   }

   return (
      <Navbar bg="primary" variant="dark" expand="md" className="riddles-navbar">
         <Container fluid>
            <Navbar.Toggle />

            <Navbar.Brand className="d-flex align-items-center action-icon-wrapper">
               <PatchQuestionFill color="white" size="1.25em" className="me-2"
                  onClick={() => goToHome()} />

               <OverlayTrigger placement="bottom" overlay={
                  <Tooltip>Go to the <strong>homepage</strong></Tooltip>
               }>
                  <span onClick={() => goToHome()}>
                     SolveMyRiddle
                  </span>
               </OverlayTrigger>
            </Navbar.Brand>

            <Navbar.Collapse className="justify-content-end">
               {user ?
                  <OverlayTrigger placement="bottom" overlay={
                     <Tooltip>Create your <strong>new</strong> Riddle!</Tooltip>
                  }>
                     <Navbar.Brand>
                        <Button onClick={() => navigate("/addriddle")}>
                           New Riddle
                        </Button>
                     </Navbar.Brand>
                  </OverlayTrigger>
                  : <></>
               }
               <Navbar.Brand>
                  <OverlayTrigger placement="bottom" overlay={
                     <Tooltip>See the ranking list</Tooltip>
                  }>
                     <Button onClick={() => navigate("/ranking")}>
                        Ranking
                     </Button>
                  </OverlayTrigger>
               </Navbar.Brand>
               <Navbar.Brand>
                  <OverlayTrigger placement="bottom" overlay={
                     <Tooltip>{user ? "do the logout" : "go to sign in page"}</Tooltip>
                  }>
                     <Button className={`me-3 ${user ? 'sign-in' : 'logout'}-button`}
                        onClick={() => user ? handleLogout() : goToLogin()}>
                        {user ? "Logout" : "SignIn"}
                     </Button>
                  </OverlayTrigger>
               </Navbar.Brand>
            </Navbar.Collapse>

            <Navbar.Brand>
               {user ?
                  <Stack direction='horizontal'>
                     <Stack className="user-info me-3" align="center">
                        <span className="user-username">@{user.username}</span>
                        <span className="user-score">{user.score ?? 0} point{user.score === 1 ? "" : "s"}</span>
                     </Stack>
                     
                     <OverlayTrigger placement="bottom" overlay={
                        <Tooltip>Hi @{user.username}!</Tooltip>
                     }>
                        <PersonCircle color="white" size="1.7em" className="action-icon" />
                     </OverlayTrigger>
                  </Stack> :
                  <Incognito onClick={() => navigate("/login")}
                     color="white" size="1.6em" className="action-icon" />
               }
            </Navbar.Brand>
         </Container>
      </Navbar >
   );
}

export default RiddlesNavbar;