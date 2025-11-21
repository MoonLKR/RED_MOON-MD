const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cheerio = require('cheerio'); 

async function search(query) {
  try {
    const url = `https://animeheaven.me/search.php?s=${query}`;  // Correct the dynamic URL with query

    // Fetch the page content using `node-fetch`
    const response = await fetch(url);
    const body = await response.text(); // Get the HTML content of the page

    const $ = cheerio.load(body);  // Load HTML content into cheerio to enable easy querying of HTML

    const results = [];  // Array to store extracted data

    // Scrape required details
    $('.similarimg .p1').each((index, element) => {
      const title = $(element).find('a').last().text().trim();  // Extract the title
      const id_link = $(element).find('a').attr('href');  // Get 'href' (this is relative)
      const link = `https://animeheaven.me/${id_link}`;  // Form the full link using base URL

      // Add the item to results array if both link and title exist
      if (link && title && id_link) {
        results.push({ title, link });
      }
    });

    return results;  // Return the array of scraped results
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw new Error('Failed to scrape the website'); // Throw error if something goes wrong
  }
}













async function scrapeWebsite(url) {
    

  try {
    const response = await fetch(url); 
    const body = await response.text();

    const $ = cheerio.load(body);
      const result = {};


        result.title = $("body > div:nth-child(3) > div.info.bc1 > div.infodiv > div.infotitle.c").text().trim();
        result.image = $("body > div:nth-child(3) > div.info.bc1 > div.infoimg > img").attr("src");
      
        result.date = $("body > div:nth-child(3) > div.info.bc1 > div.infodiv > div.infoyear.c > div:nth-child(2)").text();

        result.epishodes = $("body > div:nth-child(3) > div.info.bc1 > div.infodiv > div.infoyear.c > div:nth-child(1)").text();
        
        result.imdb = $("body > div:nth-child(3) > div.info.bc1 > div.infodiv > div.infoyear.c > div:nth-child(3)").text();
       const results = [];

    // Select all <a> elements inside .linetitle2.c2 and extract href
    $('.linetitle2.c2 a').each((index, element) => {
      const link = $(element).attr('href');                                                  
      const episodeNumber = $(element).find('.watch2.bc').text().trim();
      
      if (link && episodeNumber) {
        results.push({ episode: episodeNumber, url: link });
      }
    });
     

    return {
            
           result,
          results,
        };

      
  } catch (error) {
      console.error('Error fetching data:', error);
  }
}

module.exports = { scrapeWebsite,search }
