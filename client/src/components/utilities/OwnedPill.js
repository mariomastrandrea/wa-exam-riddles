import { Badge } from "react-bootstrap";

function OwnedPill() {
   return (
      <div className="pe-2">
         <Badge className="owned-pill" pill bg="warning" text="dark">Owned</Badge>
      </div>
   );
}

export default OwnedPill;
