import { useEffect, useState } from "react";
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
   const { riddles, sendReply, getHint } = props;

   if (!riddles || riddles.length === 0) {
      return <></>;
   }

   return (
      <Container fluid>
         {riddles.map(riddle =>
            <RiddleRow key={`riddle-${riddle.id}-row`} riddle={riddle}
               sendReply={sendReply} getHint={getHint} />)}
      </Container>
   );
}

function RiddleRow(props) {
   const { riddle, sendReply, getHint } = props;

   // context
   const user = useUser();
   const setErrorMessage = useSetErrorMessage();

   // computed values
   const repliedCorrectly = user && riddle.winner === user.username;
   const repliedWrong = user && riddle.userReply && riddle.winner !== user.username;
   const showHint1 = user && !riddle.owned && (riddle.remainingSeconds <= Math.floor(0.5 * riddle.duration));
   const showHint2 = user && !riddle.owned && (riddle.remainingSeconds <= Math.floor(0.25 * riddle.duration));

   // state
   const [hint1, setHint1] = useState();   // *TODO*
   const [hint2, setHint2] = useState();  // *TODO*

   // manage hint #1 showing 
   useEffect(() => {
      if (!showHint1) return;

      // retrieve hint1 from the backend
      getHint(riddle.id, 1).then(hint1 => {
         setHint1(hint1);
      })
         .catch(error => {
            console.log(error);
            setErrorMessage(`An error occurred loading the hint1 for riddle ${riddle.id}`);
         });
      // eslint-disable-next-line
   }, [showHint1]);

   // manage hint #2 showing 
   useEffect(() => {
      if (!showHint2) return;

      // retrieve hint2 from the backend
      getHint(riddle.id, 2).then(hint2 => {
         setHint2(hint2);
      })
         .catch(error => {
            console.log(error);
            setErrorMessage(`An error occurred loading the hint2 for riddle ${riddle.id}`);
         });
      // eslint-disable-next-line
   }, [showHint2]);

   return (
      <Row className={`riddle-row my-2 ${repliedCorrectly ? 'correct-reply' : ''} ${repliedWrong ? 'wrong-reply' : ''}`}>
         <Accordion>
            <Accordion.Item eventKey={`riddle-${riddle.id}`}>
               <Accordion.Header>
                  <RiddleHeader riddle={riddle} />
               </Accordion.Header>

               <Accordion.Body>
                  <RiddleBody riddle={riddle} hint1={hint1} hint2={hint2} sendReply={sendReply} />
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
               <CircularTimer maxSeconds={duration} size={50}
                  remainingSeconds={remainingSeconds} closed={!open} /> :
               <OpenClosePill open={open} />}
         </Col>
      </Row>
   );
}

function RiddleBody(props) {
   const { riddle, sendReply, hint1, hint2 } = props;

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
               <NotOwnedRiddleBody riddle={riddle} hint1={hint1} hint2={hint2} sendReply={sendReply} />
            }
         </Col>
         <Col className="col-xxl-1 col-sm-2 adjust d-flex align-items-center">
            <CircularTimer maxSeconds={riddle.duration} size={70}
               remainingSeconds={riddle.remainingSeconds} closed={!riddle.open} />
         </Col>
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
         <Stack gap={1} className="my-1">
            {replies.length === 0 ?
               <span className="no-replies-message">No one has yet answered this riddle</span> :  // can happen only for an open riddle
               replies.map(reply =>
                  <RiddleReply key={`${reply.username}-riddle-${id}-reply`} reply={reply} winner={winner} />)
            }
         </Stack>
         {(userReply || !open) &&
            <Stack className="mt-3">
               {userReply &&
                  <div className="user-reply-wrapper">
                     Your answer was:
                     <span key="user-reply" className="user-reply">
                        "{userReply}"
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
            </Stack>
         }
      </>
   );
}

function NotOwnedRiddleBody(props) {
   const { id, open, userReply, difficulty } = props.riddle;
   const { sendReply, hint1, hint2 } = props;

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
         setErrorMessage("Something went wrong sending your reply. Please try again");
         return;
      }

      if (isReplyCorrect) {
         // * correct reply here *

         // compute the points gained by the user
         let points = 0;

         if (difficulty === 'easy') points = 1;
         else if (difficulty === 'average') points = 2;
         else if (difficulty === 'difficult') points = 3;

         setSuccessMessage(`Hooray! Your reply was correct, you got ${points} points! ${String.fromCharCode(0xD83E, 0xDD73)} ${String.fromCharCode(0xD83C, 0xDF89)}`);
         setTimeout(() => setSuccessMessage(""), 5000); // disappear after 3 sec

         // - update user's score (add points to previous score)

         // TODO: create and call the API to update the user's score
      }

      setDisabled(true); // to disable textfield and buttons until the riddle is re-rendered
   }

   function handleReset() {
      setReply("");
      setErrorMessage("");
   }

   // *open* and *not owned* riddle
   return (
      <>
         <Stack gap={1} className="my-3">
            <Form onSubmit={handleReplySubmit}>
               <Stack direction="horizontal" gap={3}>
                  {userReply ?
                     <> {/* the user has already (not correctly) replied to this riddle */}
                        <Form.Control className="me-auto reply-form" required value={reply} readOnly />
                     </> :
                     <> {/* the user hasn't replied to this riddle yet */}
                        <Form.Control className="me-auto reply-form" required disabled={disabled}
                           placeholder="Write your answer here!" value={reply}
                           onChange={(event) => setReply(event.target.value?.trimStart())} />

                        <Button type="submit" disabled={disabled} variant="secondary">Submit</Button>
                        <div className="vr" />
                        <Button variant="outline-danger" disabled={disabled} onClick={handleReset}>Reset</Button>
                     </>
                  }

               </Stack>
            </Form>
            {userReply ?
               <div className="wrong-answer-text">
                  {/* the user has already (not correctly) replied to this riddle */}
                  Ouch... Your answer was wrong! {String.fromCodePoint(0xD83D, 0xDE2C)}
               </div> :
               <div className="hints-wrapper">
                  {/* the user hasn't replied to this riddle yet */}
                  {hint1 &&
                     <div className="hint-wrapper hint1-wrapper">
                        Hint #1: <span className="hint">{hint1}</span>
                     </div>
                  }
                  {hint2 &&
                     <div className="hint-wrapper hint2-wrapper">
                        Hint #2: <span className="hint">{hint2}</span>
                     </div>
                  }
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