import fs from 'fs';
import readline from 'readline';
export  function writeUrlsToFile(urls) {
  const filePath = 'urls.txt';
  const content = urls.join('\n');

  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error('Failed to write urls to file:', err);
    } else {
      console.log('Urls have been written to urls.txt');
    }
  });
}


export  async function readURLsFromFile(filename) {
  const urls = [];

  const fileStream = fs.createReadStream(filename);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    urls.push(line);
  }

  return urls;
}

