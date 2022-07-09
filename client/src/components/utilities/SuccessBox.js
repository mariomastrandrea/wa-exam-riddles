import { Row, Col, Alert } from 'react-bootstrap';

function SuccessBox({children}) {
   return (
      <Row className='mt-2 mx-2'>
         <Col>
            <Alert key='success' variant='success'>{children}</Alert>
         </Col>
      </Row>
   );
}

export default SuccessBox;