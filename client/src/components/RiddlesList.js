import { useState } from "react";
import { Accordion, Button, Col, Container, Form, Row, Stack } from "react-bootstrap";
import { useSetErrorMessage } from "../context/ErrorMessageContext";
import { useSetSuccessMessage } from "../context/SuccessMessageContext";
import { useSetUser, useUser } from "../context/UserContext";
import { capitalize } from "../utilities";
import CircularTimer from "./utilities/CircularTimer";
import DifficultyBadge from "./utilities/DifficultyBadge";
import OpenClosePill from "./utilities/OpenClosePill";
import OwnedPill from "./utilities/OwnedPill";


function RiddlesList(props) {
   const { riddles, sendReply, getCurrentSession } = props;

   if (!riddles || riddles.length === 0) {
      return <></>;
   }

   return (
      <Container fluid>
         {riddles.map(riddle =>
            <RiddleRow key={`riddle-${riddle.id}-row`} riddle={riddle} 
               getCurrentSession={getCurrentSession} sendReply={sendReply} />)}
      </Container>
   );
}

function RiddleRow(props) {
   const { riddle, sendReply, getCurrentSession } = props;

   return (
      <Row className="riddle-row my-2">
         <Accordion>
            <Accordion.Item eventKey={`riddle-${riddle.id}`}>
               <Accordion.Header>
                  <RiddleHeader riddle={riddle} />
               </Accordion.Header>

               <Accordion.Body>
                  <RiddleBody riddle={riddle} sendReply={sendReply} getCurrentSession={getCurrentSession} />
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
      <Row className="col-12 d-flex align-items-center">
         <Col className="col-xxl-1 col-sm-2">
            <DifficultyBadge difficulty={difficulty} />
         </Col>
         <Col className="col-xxl-10 col-sm-8 adjust d-flex align-items-center justify-content-between">
            <div className="d-flex flex-column riddle-question-wrapper">
               <span className="riddle-question">{question}</span>
               {user &&
                  <span className="riddle-owner">
                     Created by @{ownerUsername === user.username ? "you" : ownerUsername} {"("}{life}{`${life === 'now' ? '' : ' ago'}`}{")"}
                  </span>
               }
            </div>
            {owned && <OwnedPill />}
         </Col>
         <Col className="col-xxl-1 col-sm-2 adjust">
            {user ?
               <CircularTimer maxSeconds={duration} className=""
                  remainingSeconds={remainingSeconds} closed={!open} /> :
               <OpenClosePill open={open} />}
         </Col>
      </Row>
   );
}

function RiddleBody(props) {
   const { riddle, sendReply, getCurrentSession } = props;

   // context
   const user = useUser();

   if (!user) {   // user is NOT authenticated -> show only a short suggestion to sign in
      return (
         <Row className="col-12">
            <Col className="col-xxl-1 col-sm-2"></Col>
            <Col className="no-user--riddle-body riddle-body-wrapper col-xxl-10 col-sm-8 adjust">
               <NotAuthenticatedUserRiddleBody open={riddle.open} />
            </Col>
            <Col className="col-xxl-1 col-sm-2 adjust"></Col>
         </Row>
      );
   }
   // * User is authenticated here * -> show the riddle's details

   // Distinguish between *owned* and *not owned* riddle
   return (
      <Row className="col-12">
         <Col className="col-xxl-1 col-sm-2"></Col>
         <Col className="riddle-body-wrapper col-xxl-10 col-sm-8 adjust">
            {riddle.owned ?
               <OwnedOrClosedRiddleBody riddle={riddle} /> :
               <NotOwnedRiddleBody riddle={riddle} 
                  getCurrentSession={getCurrentSession} sendReply={sendReply} />
            }
         </Col>
         <Col className="col-xxl-1 col-sm-2 adjust"></Col>
      </Row>
   );
}

function NotAuthenticatedUserRiddleBody(props) {
   const { open } = props;

   return (
      <span>
         {open ?
            "Sign in to reply to this riddle!" :
            "Sign in to see this riddle's details"}
      </span>
   );
}

function OwnedOrClosedRiddleBody(props) {
   const { id, open, answer, replies, winner, userReply } = props.riddle;

   // Distinguish between *open* and *closed* riddle:
   // - if *open* -> show the riddle's replies
   // - if *closed* -> show the riddle's replies, the correct answer, and possibly the winner

   return (
      <>
         <Stack gap={1} className="mb-3">
            {replies.length === 0 ?
               <span className="no-replies-message">No one has yet answered this riddle</span> :  // can happen only for an open riddle
               replies.map(reply =>
                  <RiddleReply key={`${reply.username}-riddle-${id}-reply`} reply={reply} winner={winner} />)
            }
         </Stack>
         {userReply &&
            <div className="user-reply-wrapper">
               Your answer was:
               <span key="user-reply" className="user-reply">
                  "{capitalize(userReply)}"
               </span>
            </div>
         }
         {!open &&
            <div className="correct-answer-wrapper">
               The correct answer was:
               <span key="correct-answer" className="correct-answer">
                  "{capitalize(answer)}"
               </span>
            </div>
         }
      </>
   );
}

function NotOwnedRiddleBody(props) {
   const { id, open, userReply, difficulty } = props.riddle;
   const { getCurrentSession, sendReply, hint1, hint2 } = props;

   // state
   const [reply, setReply] = useState(userReply ?? "");
   const [disabled, setDisabled] = useState(false);

   // context
   const setErrorMessage = useSetErrorMessage();
   const setSuccessMessage = useSetSuccessMessage();
   const setUser = useSetUser();

   // Distinguish between *open* and *closed* riddle:
   // - if *closed* -> show the riddle's replies, the correct answer, and possibly the winner
   // - if *open* -> shows the textfield to reply to the riddle, if not yet replied; otherwise show the wrong reply

   if (!open) {
      return <OwnedOrClosedRiddleBody riddle={props.riddle} userReply={userReply} />;
   }

   async function handleReplySubmit(event) {
      event.preventDefault();
      setErrorMessage("");

      const processedReply = reply.trimEnd().toLowerCase();
      let isReplyCorrect = false;

      // handle submit
      try {
         isReplyCorrect = await sendReply(id, processedReply);
      }
      catch (error) {
         console.log(error);
         setErrorMessage("Something went wrong sending your reply");
         return;
      }

      if (isReplyCorrect) {
         // * correct reply here *

         // compute the points gained by the user
         let points = 0;

         if (difficulty === 'easy') points = 1;
         else if (difficulty === 'average') points = 2;
         else if (difficulty === 'difficult') points = 3;

         setSuccessMessage(`Congratulations, your reply was correct! You got ${points} points`);
         setTimeout(() => setSuccessMessage(""), 3000); // disappear after 3 sec

         // - update user's score 
         getCurrentSession().then(user => {
            setUser(user);
         })
         .catch(err => {
            setErrorMessage("An error occurred while getting your current session");
         });

      }
      
      setDisabled(true); // to disable textfield and buttons until the riddle is re-rendered
   }

   // *open* and *not owned* riddle
   return (
      <>
         <Stack gap={1} className="my-3">
            <Form onSubmit={handleReplySubmit}>
               <Stack direction="horizontal" gap={3}>
                  {userReply ?
                     <>
                        <Form.Control className="me-auto" required value={reply} />
                        <Button disabled variant="secondary">Submit</Button>
                     </> :
                     <>
                        <Form.Control className="me-auto" required disabled={disabled}
                           placeholder="Write your answer here!" value={reply} 
                           onChange={(event) => setReply(event.target.value?.trimStart())} />

                        <Button type="submit" disabled={disabled} variant="secondary">Submit</Button>
                        <div className="vr" />
                        <Button variant="outline-danger" disabled={disabled} onClick={() => setReply("")}>Reset</Button>
                     </>
                  }

               </Stack>
            </Form>
            {userReply &&
               <div className="wrong-answer-text">
                  Ouch... Your answer was wrong!
               </div>
            }
         </Stack>
      </>
   );
}

function RiddleReply(props) {
   const { username, reply, life } = props.reply;
   const { winner } = props;
   const correct = username === winner;

   // context
   const user = useUser();

   return (
      <div className={`riddle-reply-wrapper ${correct ? "correct" : "wrong"}`}>
         {correct ?
            <span key="riddle-reply-icon" className="riddle-reply-icon">&#9989;</span> : // correct answer
            <span key="riddle-reply-icon" className="riddle-reply-icon">&#10060;</span>  // wrong answer
         }
         <span key="riddle-reply" className="riddle-reply">
            "{reply}"
         </span>
         <span key="riddle-reply-info" className="riddle-reply-info">
            by @{username === user.username ? "you" : username} {"("}{life}{`${life === 'now' ? '' : ' ago'}`}{")"}
         </span>
      </div>
   );
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