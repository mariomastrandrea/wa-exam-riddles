import { Badge } from "react-bootstrap";

function OpenClosePill({ open }) {
   if (open) {
      return <Badge className="open-close-pill" pill bg="success">Open</Badge>;
   }
   else {
      return <Badge className="open-close-pill" pill bg="danger">Closed</Badge>;
   }
}

export default OpenClosePill;