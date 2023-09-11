import fs from 'fs';
import { parse } from 'csv-parse';


const csvFilePath = 'helpMirriam/file.csv';
const outputFilePath = 'helpMirriam/file.txt';

// Define the column name for which you want to extract metadata
const columnName = 'issuer';

// Define an empty array to store the metadata values
let metadata = [];

fs.createReadStream(csvFilePath)
  .pipe(parse())
  .on('data', (row) => {
    // for each row, push the value 
    const value = row[Object.keys(row)[0]];
    metadata.push(value);
    // remove the first element of the array
    //metadata.shift();
    // get the unique values
    metadata = [...new Set(metadata)];
    metadata = metadata.filter((item) => item !== columnName);
    



  })
  .on('end', () => {
    // Log the metadata array to the console
    console.log(metadata);
    fs.writeFile(outputFilePath, metadata.join('\n'), (err) => {
        if (err) throw err;
        console.log('Metadata written to file!');
      });
  });

  //write the metadata to a file 





