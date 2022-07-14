
// It parses an integer >= 0 from a string. Otherwise, it returns null if the 
// argument is not a String, or NaN if the string does not represent an integer >= 0
function int(string) {
   if (isNum(string)) return string;
   if (typeof string !== 'string') return null;
   
   // * here 'string' is of type String *
   return /^[\d]+$/.test(string) ? Number(string) : NaN;
}

// It checks if the argument is a integer >= 0. The argument can be either a Number or a String
function isInt(num) {
   if (typeof num === 'number')
       return num >= 0 && num === Math.floor(num);
   else {
       const integer = int(num);
       return typeof integer === 'number' && !isNaN(integer);
   }
}

function isNum(num) {
   return typeof num === 'number';
}

module.exports = { 
   int, isInt, isNum
};