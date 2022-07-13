import { Accordion, Badge, Col, Container, Row } from "react-bootstrap";
import { useUser } from "../context/UserContext";
import CircularTimer from "./utilities/CircularTimer";

function RiddlesList(props) {
   const { riddles } = props;

   if (!riddles || riddles.length === 0) {
      return <></>;
   }

   return (
      <Container fluid>
         {riddles.map(riddle => <RiddleRow key={`riddle-${riddle.id}-row`} riddle={riddle} />)}
      </Container>
   );
}

function RiddleRow(props) {
   const { riddle } = props;

   // context
   const user = useUser();

   return (
      <Row className="riddle-row my-2">
         <Accordion>
            <Accordion.Item eventKey={`riddle-${riddle.id}`}>
               <Accordion.Header>
                  <RiddleHeader riddle={riddle} />
               </Accordion.Header>

               <Accordion.Body>
                  <RiddleBody riddle={user ? riddle : undefined} />
               </Accordion.Body>
            </Accordion.Item>
         </Accordion>

      </Row>
   );
}

function RiddleHeader(props) {
   const { difficulty, question, owned, open, remainingSeconds, duration, ownerUsername, life } = props.riddle;
   const user = useUser();

   return (
      <>
         <Col className="col-xxl-1 col-sm-2">
            <DifficultyBadge difficulty={difficulty} />
         </Col>
         <Col className="col-xxl-10 col-sm-8 adjust d-flex align-items-center justify-content-between">
            <div className="d-flex flex-column riddle-question-wrapper">
               <span className="riddle-question">{question}</span>
               { user ?
                  <span className="riddle-owner">
                     Created by @{ownerUsername === user.username ? "you" : ownerUsername} {"("}{life}{`${life === 'now' ? '' : ' ago'}`}{")"}
                  </span> : <></>
               }
            </div>
            {owned ?
               <div className="pe-3">
                  <Badge className="owned-pill" pill bg="warning" text="dark">Owned</Badge>
               </div> : <></>}
         </Col>
         <Col className="col-xxl-1 col-sm-2 adjust">
            {user ?
               <CircularTimer maxSeconds={duration} className=""
                  remainingSeconds={remainingSeconds} closed={!open} /> :
               <OpenClosePill open={open} />}
         </Col>
      </>
   );
}

function RiddleBody(props) {

   // TODO
}

function DifficultyBadge({ difficulty }) {
   if (difficulty === 'easy') {
      return <Badge className="difficulty-badge" bg="primary">Easy</Badge>;
   }
   else if (difficulty === 'average') {
      return <Badge className="difficulty-badge" bg="secondary">Average</Badge>;
   }
   else if (difficulty === 'difficult') {
      return <Badge className="difficulty-badge" bg="dark">Difficult</Badge>;
   }
}

function OpenClosePill({ open }) {
   if (open) {
      return <Badge className="open-close-pill" pill bg="success">Open</Badge>;
   }
   else {
      return <Badge className="open-close-pill" pill bg="danger">Closed</Badge>;
   }
}

function RiddlePad(props) {
   const { id } = props;

   return (
      <Row className={`riddle-row-pad pad-${id} px-1`}>
         <Accordion>
            <Accordion.Item eventKey={`riddle-pad-${id}`}>
               <Accordion.Header onClick={() => undefined} />
            </Accordion.Item>
         </Accordion>

      </Row>
   );
}

export { RiddlesList, RiddlePad };