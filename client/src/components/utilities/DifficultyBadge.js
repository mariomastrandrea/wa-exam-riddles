import { Badge } from "react-bootstrap";

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

export default DifficultyBadge;