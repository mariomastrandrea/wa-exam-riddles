import { ListGroup } from "react-bootstrap"
import { useNavigate } from "react-router-dom";
import { useSetErrorMessage } from "../../context/ErrorMessageContext";
import { useSetSuccessMessage } from "../../context/SuccessMessageContext";
import { useUser } from "../../context/UserContext";
import { convertToSnakeCase } from "../../utilities";


function FiltersBox(props) {
   // context
   const setErrorMessage = useSetErrorMessage();
   const setSuccessMessage = useSetSuccessMessage();
   const user = useUser();

   const { activeFilter, filters } = props;
   const navigate = useNavigate();

   const handleChangeFilter = (key) => {
      setErrorMessage(""); 
      setSuccessMessage("");
      navigate(`/${key}`);
   };

   const filtersElements = filters.map(name => {
      // 'Owned' and 'Not owned' filters are available only for authenticated users
      if (!user && (name === 'Owned' || name === 'Not owned'))    
         return null;

      const key = convertToSnakeCase(name);

      return (
         <ListGroup.Item key={`${key}-filter`} active={activeFilter === key}
            action={activeFilter !== key} onClick={() => handleChangeFilter(key)}>
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