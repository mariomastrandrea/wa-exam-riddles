import { Row, Col, Alert } from 'react-bootstrap';

function ErrorBox({children}) {
   return (
      <Row className='mt-2 mx-2'>
         <Col>
            <Alert key='danger' variant='danger'>{children}</Alert>
         </Col>
      </Row>
   );
}

export default ErrorBox;