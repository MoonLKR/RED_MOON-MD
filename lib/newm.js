const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require('cheerio');



async function x_search(query) {
  try {
    const url = `https://www.1377x.to/search/${query}/1/`;
    const response = await fetch(url);
    const body = await response.text();

    const $ = cheerio.load(body);
    const results = [];

    $('td.coll-1.name').each((index, element) => {
      const linkElement = $(element).find('a').last(); // Get the last <a> tag (the second one)
      if (linkElement.length) {
        results.push({
          title: linkElement.text().trim(),
          link: "https://www.1377x.to" + linkElement.attr('href') // Ensure full URL
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Error fetching search results:', error);
    return [];
  }
}

//==================================================================================================================

async function x_info_dl(url) {
  try {
    const response = await fetch(url);
    const body = await response.text();
    const $ = cheerio.load(body);

    const result = {};

    // Scrape data
    result.title = $('div.box-info-heading.clearfix > h1').text().trim();
    result.image = $('div.torrent-image-wrap img').attr('src');
    result.date = $('ul:nth-child(3) > li:nth-child(3) > span').text();
    result.dllink = $("ul.l9007bbd0b313f4aa20553ab76822d4971c77b323 li a").first().attr("href");



    return result;
  } catch (error) {
    console.error('Error fetching torrent info:', error);
    return null;
  }
}

module.exports = { x_search, x_info_dl };
