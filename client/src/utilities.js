
function capitalize(string) {
   if (typeof string !== "string" || string.length === 0)
      return null;

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

