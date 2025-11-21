const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require('cheerio');

async function xfull_search(url) {
  try {

    const sadas = `https://sexfullmovies.sbs/?s=${url}`
    const response = await fetch(sadas); // Fetch the page content
    const body = await response.text();

    const $ = cheerio.load(body);
  
    const result = [];

    $("div.module > div.content.rigth.csearch > div > div > article").each((_, element) => {
        result.push({
            title: $(element).find("div.title > a").text().replace(/\n/g, '').trim(),
            link: $(element).find("div.title > a").attr("href")
            
        });
    });
   
     return {
      status: true,
      creater: '@Darksadas-YT',
      
      data: result,
    };

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

//=====================================================================================================================

async function xfull_dl(url) {
  try {
    const response = await fetch(url); // Fetch the page content
    const body = await response.text();

    const $ = cheerio.load(body);
    
   const result = {};

    // Scrape data
    result.title = $("div.content.right > div.sheader > div.data > h1").text().trim();
    result.image = $("div.content.right > div.sheader > div.poster > img").attr("src");
    result.genres = [];
    $("div.content.right > div.sheader > div.data > div.sgeneros > a").each((_, element) => {
        result.genres.push($(element).text());
    });
    
    result.imdb = $("#single > div.content.right > div.sheader > div.data > div.starstruck-ptype > div > div > div > div.starstruck-rating > span.dt_rating_vgs").text();

    const download_links = [];
    $("div > div > table > tbody > tr").each((_, element) => {
        download_links.push({
           
            quality: $(element).find("td").eq(1).text(),
            link: $(element).find("td > a").attr("href")
        });
    });

    return {
            status: true,
            creator: '@Darksadas-YT',
            data: result,
            dl_links: download_links,
        }

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}



  module.exports = { xfull_search, xfull_dl }
