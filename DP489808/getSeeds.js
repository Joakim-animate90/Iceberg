import {readURLsFromFile} from './utils.js'
export  async function getSeeds(){
    const filename = 'urls.txt';
    let seedsURL = await readURLsFromFile(filename)
    return seedsURL
}