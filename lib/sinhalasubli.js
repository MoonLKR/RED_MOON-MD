const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require("cheerio")
const CREATOR = "@Darksadas-YT"

async function sinhalasub_search(query) {
    try {
    
        const baseUrl = 'https://sinhalasub.lk/';
        const searchUrl = `${baseUrl}?s=${encodeURIComponent(query)}`;
        const cookies = 'starstruck_8c9b99985687fb6ab1d030c04b088ebb';
        
        const response = await fetch(searchUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
            'Cookie': cookies,
          },
        });
        
       
        if (!response.ok) {
          throw new Error('Failed to fetch the page');
        }
    
       
        const html = await response.text();
        const $ = cheerio.load(html);
    
        // Extract results
        const data = $('.search-page .result-item article')
          .map((index, element) => ({
            No: index + 1,
            Title: $(element).find('.details .title a').text().trim(),
            Desc: $(element).find('.details .contenido p').text().trim(),
            Img: $(element).find('.image img').attr('src'),
            Type: $(element).find('.image span').text().trim(),
            Link: $(element).find('.details .title a').attr('href'),
            Year: $(element).find('.details span .rating').text().trim(),
            Rating: $(element).find('.details span').text().trim(),
          })).get();  // Convert cheerio elements to a plain array
    
return data;
    
    } catch (error) {
        const errors = {
            status: false,
            creator: CREATOR,
            error: error
        }
        console.log(errors)
    }
}

//================================================

async function sinhalasub_info(url) {
    try {
       
        const cookies = 'starstruck_8c9b99985687fb6ab1d030c04b088ebb'; // Replace with actual cookies if required

    // Fetch the page
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
        'Cookie': cookies,
      },
    });

    // Load and parse the HTML response using cheerio
    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract movie details
    const newsArticle = $(".sheader").first();
    const title = $("#single > div.content.right > div.sheader > div.data > h1").text();
    const date = newsArticle.find(".extra .date").text().trim();
    const country = newsArticle.find(".extra .country").text().trim();
    const duration = newsArticle.find(".extra .runtime").text().trim();
    const infoMovie = $("#info").first();
    const desc = infoMovie.find(".wp-content p").text().trim();
    const imgbrating = infoMovie.find("#repimdb strong").text().trim();
    const author = $("strong a").text();
    const subtitles = $(" h1 center strong").text();

    // Extract gallery images
    const images = [];
    $('#dt_galery .g-item a img').each((index, element) => {
      const src = $(element).attr('src');
      images.push(src.replace(/\n/g, ""));
    });

    // Extract download links
const results = [];
$('#download .links_table tbody tr').each((index, element) => {
  results.push({
    link: $(element).find('a').attr('href'),
    quality: $(element).find('.quality').text().trim(),
    size: $(element).find('td').last().text().trim(),
  });
});


    return {
      status: true,
      creater: 'Darksadas-YT',
      title,
      date,
      country,
      duration,
      description: desc,
      rating: imgbrating,
      author,
      subtitles,
      images,
      downloadLinks: results,
    };

        

    } catch (error) {
        const errors = {
            status: false,
            creator: CREATOR,
            error: error.message
        };
        console.log(errors);
    }
}

//==================================================================

async function sinhalasub_dl(url) {
    try {
       
        const cookies = 'starstruck_8c9b99985687fb6ab1d030c04b088ebb'; // Replace with actual cookies if required

    // Fetch the page
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
        'Cookie': cookies,
      },
    });

    // Load and parse the HTML response using cheerio
    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract the required link
   const dllink = $('#download-link').attr('href');

  return { downloadLink: dllink };



    } catch (error) {
        const errors = {
            status: false,
            creator: CREATOR,
            error: error.message
        };
        console.log(errors);
    }
}

  module.exports = { sinhalasub_search, sinhalasub_info, sinhalasub_dl }
