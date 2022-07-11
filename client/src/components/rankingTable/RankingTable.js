import { Table } from "react-bootstrap";
import RankingHeaderRow from "./RankingHeaderRow";
import RankingRow from "./RankingRow";

function RankingTable(props) {
   const { rankingList, headers } = props;

   return (
      <Table hover className="mx-2" id="ranking-table">
         <thead>
            <RankingHeaderRow headers={headers} />
         </thead>

         <tbody>
            {rankingList.map((user, index) => 
               <RankingRow key={`${index}-entry`} position={user.position} 
                  username={user.username} score={user.score} />
            )}
         </tbody>
      </Table>
   );
}

export default RankingTable;