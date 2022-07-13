import { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { useErrorMessage, useSetErrorMessage } from "../context/ErrorMessageContext";
import ErrorBox from "../components/utilities/ErrorBox";
import RankingTable from "../components/RankingTable";


function RankingPage(props) {
   const { getRankingList } = props;

   // state
   const [rankingList, setRankingList] = useState([]);
   const [loadingRanking, setLoadingRanking] = useState(true);

   // context
   const errorMessage = useErrorMessage();
   const setErrorMessage = useSetErrorMessage();

   useEffect(() => {
      setErrorMessage("");

      getRankingList().then(rankingList => {
         setRankingList(rankingList);
         setLoadingRanking(false);
      })
      .catch(err => {
         console.log(err);
         setErrorMessage("An error occurred while retrieving the ranking list");
         setLoadingRanking(false);
      });
      // eslint-disable-next-line
   }, [])

   if (loadingRanking) {
      return <></>;
   }

   return errorMessage ?
      <ErrorBox>{errorMessage}</ErrorBox> :

      <>
         <Row className="mt-3">
            <Col></Col>

            <Col xs={9} sm={6} lg={5} xl={4} className='my-2 p-2'>
               <Row align="center" className="my-2">
                  { /* top-3 ranking list */}
                  <h1>Top-3 users ranking list</h1>
               </Row>

               <Row as="main" className="my-4">
                  <RankingTable headers={["#", "username", "score"]} rankingList={rankingList} />
               </Row>
            </Col>

            <Col></Col>
         </Row>
      </>

}

export default RankingPage;