import { ListGroup } from "react-bootstrap"
import { useNavigate } from "react-router-dom";
import { capitalize } from "../utilities";

function FiltersBox(props) {
   const navigate = useNavigate();
   const { setErrorMessage, setSuccessMessage, active, className } = props;

   const handleChangeFilter = (key) => {
      setErrorMessage(""); 
      setSuccessMessage("");
      navigate(`/${key}`);
   };

   const filtersElements = props.filters.map(name => {
      const key = capitalize(name);

      return (
         <ListGroup.Item key={`${key}-filter`} active={active === key}
            action={active !== name} onClick={() => handleChangeFilter(key.toLowerCase())}>
               {name}
         </ListGroup.Item>
      );
   });

   return (
      <ListGroup className={className}>
         {filtersElements}
      </ListGroup>
   );
}

export default FiltersBox;