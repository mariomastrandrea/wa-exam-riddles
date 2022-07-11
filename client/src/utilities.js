
function capitalize(string) {
   if (typeof string !== "string")
      return null;
   
   if (string.length === 0) 
      return string;
   
   if (string.length === 1)
      return string.charAt(0).toUpperCase();

   return string.charAt(0).toUpperCase() + string.slice(1);
}

function loadFilters() {
   const filters = [
      "All",
      "Open",
      "Closed",
      "Owned"
   ];

   return filters;
}

export { capitalize, loadFilters };

