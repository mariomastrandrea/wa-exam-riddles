import { Table } from "react-bootstrap";

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

function RankingHeaderRow({headers}) {
   
   const headersElements = headers.map(name => {
      return <th scope="col" key={`${name}-header`}>{name}</th>;
   });

   return <tr>{headersElements}</tr>;
}

function RankingRow(props) {
   const {position, username, score} = props;

   return (
      <tr id={`${username}-row`}>
         <td>{position}</td>
         <td>{username}</td>
         <td>{score}</td>
      </tr>
   );
}

export default RankingTable;