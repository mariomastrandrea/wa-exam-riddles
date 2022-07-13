import { Row, Col, Alert } from 'react-bootstrap';

function ErrorBox({children, className}) {
   let lines;

   if (typeof children === "string") {
      lines = children.split("\n").map((line, index) => <p key={`error-${index}`}>{line}</p>);
   }

   return (
      <Row className='mt-1 mb-3 pe-5 ps-3 error-box'>
         <Col className={className}>
            <Alert variant='danger'>{lines ? lines : children}</Alert>
         </Col>
      </Row>
   );
}

export default ErrorBox;