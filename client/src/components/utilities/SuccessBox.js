import { Row, Col, Alert } from 'react-bootstrap';

function SuccessBox({children, className}) {
   let lines;

   if (typeof children === "string") {
      lines = children.split("\n").map((line, index) => <p key={`success-${index}`}>{line}</p>);
   }

   return (
      <Row className='mt-1 mb-3 pe-5 ps-3 success-box'>
         <Col className={className}>
            <Alert variant='success'>{lines ? lines : children}</Alert>
         </Col>
      </Row>
   );
}

export default SuccessBox;