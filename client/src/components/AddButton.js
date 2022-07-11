import { Button, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function AddButton(props) {
   const navigate = useNavigate();

   return (
      <Col className="d-flex flex-row-reverse me-4 mt-3">
         <OverlayTrigger placement="top" overlay={
            <Tooltip>
               Create your <strong>new</strong> riddle!
            </Tooltip>}>

            <Button onClick={() => navigate("/addriddle")} className="circular-button">
               {props.children}
            </Button>
         </OverlayTrigger>
      </Col>
   );
}

export default AddButton;