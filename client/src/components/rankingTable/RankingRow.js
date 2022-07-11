
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

export default RankingRow;