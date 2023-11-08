// function md5(data) {
//     let result = "";
//     const hexCharacters = "0123456789abcdef";
  
//     for (let i = 0; i < 16; i++) {
//       const byte = (data[i] & 0xff);
//       result += hexCharacters.charAt(byte >> 4) + hexCharacters.charAt(byte & 0x0f);
//     }
  
//     return result;
//   }
  
//   function getHashInfitePagination(input) {
//     // If the input is not provided, use the current timestamp in milliseconds
//     input = input || Date.now();
  
//     // Concatenate the input with the fixed string
//     const combinedString = input + "8dUrFaY6r!YHgxQfiLu*uG61*";
  
//     // Calculate the MD5 hash
//     const md5Hash = md5(Buffer.from(combinedString, "binary"));
  
//     return md5Hash;
//   }
  
//   // Example usage:
//   const input = 1698851883;
//   const validation = getHashInfitePagination(input);
//   console.log(validation);
  

const crypto = require('crypto')
function getHashInfitePagination(input) {
    // If the input is not provided, use the current timestamp in milliseconds
    input = input || Date.now();
  
    // Concatenate the input with the fixed string
    const combinedString = input + "8dUrFaY6r!YHgxQfiLu*uG61*";
  
    // Create an MD5 hash object
   // const md5Hash = require('crypto').createHash('md5');
   const md5Hash = md5(combinedString)
  
    // Update the hash object with the combined string
    //md5Hash.update(combinedString);
  
    // Calculate the MD5 hash in hexadecimal representation
    const hashResult = md5Hash.digest('hex');
  
    return hashResult;
  }
  

// // Example usage:
const j = "1698851883";
const validation =  getHashInfitePagination(j);
console.log(validation);
