
function convertToSnakeCase(string) {
   return string.toLowerCase().split(" ").filter(x => x.length > 0).join("-");
}

function revertFromSnakeCase(string) {
   return string.charAt(0).toUpperCase() + string.split("-").join(" ").slice(1);
}

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
      "Owned",
      "Not owned"
   ];

   return filters;
}

export { convertToSnakeCase, revertFromSnakeCase, capitalize, loadFilters };

