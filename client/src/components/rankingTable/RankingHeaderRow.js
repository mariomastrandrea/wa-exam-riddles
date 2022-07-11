
function RankingHeaderRow({headers}) {
   
   const headersElements = headers.map(name => {
      return <th scope="col" key={`${name}-header`}>{name}</th>;
   });

   return <tr>{headersElements}</tr>;
}

export default RankingHeaderRow;