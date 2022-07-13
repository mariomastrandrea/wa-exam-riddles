import { Col } from "react-bootstrap";
import FiltersBox from "./utilities/FiltersBox";

function RiddlesSidebar(props) {
   const { activeFilter, filters } = props;

   return (
      <Col as="aside" className="bg-light col-3 p-4">
         <FiltersBox filters={filters} activeFilter={activeFilter} />
      </Col>
   );
}

export default RiddlesSidebar;