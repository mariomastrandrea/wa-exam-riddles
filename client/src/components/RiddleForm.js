import { useNavigate } from "react-router";
import { useState } from "react";
import { Card, Col, FloatingLabel, Form, Row, Button } from "react-bootstrap";
import { useSetErrorMessage } from "../context/ErrorMessageContext";
import { useSetSuccessMessage } from "../context/SuccessMessageContext";

function RiddleForm(props) {
   const { addRiddle } = props;

   const defaultValues = {
      question: "",           // string
      answer: "",             // string
      difficulty: "average",  // string (easy, average, difficult)
      duration: 30,           // number (seconds) from 30 to 600
      hint: ""                // string
   }

   // state
   const [question, setQuestion] = useState(defaultValues["question"]);
   const [answer, setAnswer] = useState(defaultValues["answer"]);
   const [difficulty, setDifficulty] = useState(defaultValues["difficulty"]);
   const [duration, setDuration] = useState(defaultValues["duration"]);
   const [hint1, setHint1] = useState(defaultValues["hint"]);
   const [hint2, setHint2] = useState(defaultValues["hint"]);


   // context
   const setErrorMessage = useSetErrorMessage();
   const setSuccessMessage = useSetSuccessMessage();

   const navigate = useNavigate();

   async function handleSubmit(event) {
      event.preventDefault();
      const errorMessages = [];

      // *input checks* -> I repeat input checks here for better robustness

      if (question.trim().length === 0)
         errorMessages.push("• Question is required");

      if (answer.trim().length === 0)
         errorMessages.push("• Answer is required");

      if (difficulty !== "easy" && difficulty !== "average" && difficulty !== "difficult")
         errorMessages.push("• Difficulty must be one of easy, average, or difficult");

      if (!(duration >= 30 && duration <= 600))
         errorMessages.push("• Duration must be between 30 and 600 seconds");

      if (hint1.trim().length === 0)
         errorMessages.push("• Hint #1 is required");

      if (hint2.trim().length === 0)
         errorMessages.push("• Hint #2 is required");

      if (errorMessages.length > 0) {
         setErrorMessage(errorMessages.join("\n"));
         return;
      }

      // *all input is ok here*

      const newRiddle = {
         question,
         answer,
         difficulty,
         duration,
         hint1,
         hint2
      };

      try {
         const added = await addRiddle(newRiddle);

         if (!added) {
            setErrorMessage("Already exist a riddle with the same question. Please add a new one!");
            return;
         }
      }
      catch (error) {
         console.log(error);
         setErrorMessage("Something went wrong adding your Riddle. Please try again.");
         return;
      }

      setErrorMessage("");
      setSuccessMessage("Your Riddle was successfully added!");
      setTimeout(() => setSuccessMessage(""), 3000); // clear success message after 3 seconds

      // return to the home page
      navigate("/");
   }

   const handleReset = () => {
      setQuestion(defaultValues['question']);
      setAnswer(defaultValues['answer']);
      setDifficulty(defaultValues['difficulty']);
      setDuration(defaultValues['duration']);
      setHint1(defaultValues['hint']);
      setHint2(defaultValues['hint']);

      setErrorMessage("");
   }

   const handleCancel = () => {
      setErrorMessage("");
      setSuccessMessage("");
      navigate("/");
   }

   return (
      <Card className="riddle-form">
         <Card.Title as="h3" className="py-1">New Riddle!</Card.Title>

         <Card.Body>
            <Form onSubmit={handleSubmit}>
               <Form.Group className='my-3'>
                  <FloatingLabel label="Question" controlId="floatingQuestion">
                     <Form.Control as="textarea" value={question} required={true}
                        placeholder="Question" style={{ height: "5rem" }}
                        onChange={event => setQuestion(event.target.value)} />
                  </FloatingLabel>
               </Form.Group>

               <Form.Group className='my-3'>
                  <FloatingLabel label="Answer" controlId="floatingAnswer">
                     <Form.Control as="textarea" value={answer} required={true}
                        placeholder="Answer" style={{ height: "5rem" }}
                        onChange={event => setAnswer(event.target.value)} />
                  </FloatingLabel>
               </Form.Group>

               <Row>
                  <Form.Group as={Col} xs={5} className='my-2'>
                     <FloatingLabel label="Difficulty" controlId="floatingDifficulty">
                        <Form.Select value={difficulty} required={true}
                           onChange={event => setDifficulty(event.target.value)}>
                           <option value="easy">Easy</option>
                           <option value="average" >Average</option>
                           <option value="difficult">Difficult</option>
                        </Form.Select>
                     </FloatingLabel>
                  </Form.Group>

                  <Form.Group as={Col} className='my-2'>
                     <FloatingLabel label="Duration (sec)" controlId="floatingDuration">
                        <Form.Control type="number" min={30} max={600} value={duration}
                           required={true} placeholder="Duration"
                           onChange={event => setDuration(event.target.value)} />
                     </FloatingLabel>
                  </Form.Group>
               </Row>

               <Form.Group className='my-3'>
                  <FloatingLabel label="Hint #1" controlId="floatingHint1">
                     <Form.Control type="text" value={hint1} required={true} placeholder="Hint #1"
                        onChange={event => setHint1(event.target.value)} />
                  </FloatingLabel>
               </Form.Group>

               <Form.Group className='my-3'>
                  <FloatingLabel label="Hint #2" controlId="floatingHint2">
                     <Form.Control type="text" value={hint2} required={true} placeholder="Hint #2"
                        onChange={event => setHint2(event.target.value)} />
                  </FloatingLabel>
               </Form.Group>

               <Form.Group className='my-4' align="right">
                  <Button variant='outline-danger' onClick={handleCancel}
                     className="me-1 mt-2 py-2 px-3">Cancel</Button>
                  <Button variant='outline-secondary' onClick={handleReset}
                     className="mx-1 mt-2 py-2 px-3">Reset</Button>
                  <Button variant='outline-primary' type="submit"
                     className="ms-1 mt-2 py-2 px-3">Confirm</Button>
               </Form.Group>
            </Form>
         </Card.Body>
      </Card>
   );
}

export default RiddleForm;