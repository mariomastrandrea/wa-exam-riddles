import { ListGroup } from "react-bootstrap"
import { useNavigate } from "react-router-dom";
import { useSetErrorMessage } from "../../context/ErrorMessageContext";
import { useSetSuccessMessage } from "../../context/SuccessMessageContext";


function FiltersBox(props) {
   // context
   const setErrorMessage = useSetErrorMessage();
   const setSuccessMessage = useSetSuccessMessage();

   const { active, filters } = props;
   const navigate = useNavigate();

   const handleChangeFilter = (key) => {
      setErrorMessage(""); 
      setSuccessMessage("");
      navigate(`/${key}`);
   };

   const filtersElements = filters.map(name => {
      const key = name.toLowerCase();

      return (
         <ListGroup.Item key={`${key}-filter`} active={active === name}
            action={active !== name} onClick={() => handleChangeFilter(key)}>
               {name}
         </ListGroup.Item>
      );
   });

   return (
      <ListGroup>
         {filtersElements}
      </ListGroup>
   );
}

export default FiltersBox;