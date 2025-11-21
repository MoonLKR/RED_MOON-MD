const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require("cheerio")
const axios = require("axios")
const CREATOR = 'Darksadas YT'

async function sinhalasubb_search(query) {
    try {
    
        
        const searchUrl = `https://sinhalasub.lk/tvshows/?s=${query}`;
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

async function sinhalasubtv_info(query) {
    try {


    const response = await fetch(query)
    const body = await response.text();


    const $ = cheerio.load(body);
 

    const title = $("#single > div.content.right > div.sheader > div.data > h1").text();
    const date = $("#single > div.content.right > div.sheader > div.data > div.extra > span.date").text();
    const categorydata = $("#single > div.content.right > div.sheader > div.data > div.sgeneros > a").text().trim();
    const category = categorydata.match(/([A-Z][a-z]+|\d+\+?)/g);
    const description = $("#info > div.wp-content > p").text().trim();
    const imdb = $("#repimdb > strong").text();
    const director = $("#cast > div.persons > div.person > div.img > a > img").attr("alt");
    const image = $("#single > div.content.right > div.sheader > div.poster > img").attr("src");


    const images = [];
    $('#dt_galery .g-item a img').each((index, element) => {
      const src = $(element).attr('src');
      images.push(src.replace(/\n/g, ""));
    });




    const episodes = []
    
    $("#seasons > div.se-c > div.se-a > ul > li").each((i, el) => {
        const title = $(el).find("div.numerando").text()
        const date = $(el).find("div > span.date").text()
        const episode_link = $(el).find("div > a").attr("href")
        episodes.push({title, date, episode_link})
    })

    const result = {
        status: true,
        creator: CREATOR, 
        result: {
            title: title,
            imdb: imdb,
            date: date,
            category: category,
            director: director,
            description: description,
            image: images,
            episodes: episodes
    }}

    if (episodes.length === 0) {
        console.log("No movies found with the given query.");
    } else {
        //console.log("Movies found:", movies.length);
       return result;
    }
    
    } catch (error) {
        const errors = {
            status: false,
            creator: CREATOR,
            error: error
        }
        console.log(errors)
    }
}


async function sinhalasubtv_dl(query) {
  try {
      const https = /^https:\/\/[^\s/$.?#].[^\s]*$/;
      if (!query || !https.test(query)) {
          console.log("Invalid URL. Please provide a valid HTTPS URL.");
          console.log("මොකක්ද මනුස්සයෝ කරන්නෙ Pirate.lk FILM URL එකක් දාපන්");
          return;
      }
      const response = await fetch(query)
      const body = await response.text();
  
  
      const $= cheerio.load(body);


      const title = $("#info > h1").text()
      const ep_name = $("#info > div > h3").text();
      const description = $("#info > div.wp-content > p").text().trim();
      const date = $("#info > span.date").text();

      const downlink = [];
      const downloadLinks = $("#download > div > div > table > tbody > tr");

      downloadLinks.each((index, row) => {
          const quality = $(row).find("td:nth-child(2)").text().trim();
          const size = $(row).find("td:nth-child(3)").text().trim();
          const downloadLinkOut = $(row).find("td:nth-child(1) a").attr("href");

          if (quality && size && downloadLinkOut) {
              downlink.push({ quality, size, link: downloadLinkOut });
          }
      });

      const detailedDownlinkPromises = downlink.map(async (item) => {
          try {
              const detailPage = await axios.get(item.link);
              const $detail = cheerio.load(detailPage.data);
              const link = $detail('#download-link').attr('href');
              return { ...item, link };
          } catch (error) {
              console.error(`Error fetching details for link ${item.link}: ${error.message}`);
              return item;
          }
      });

      const detailedDownlink = await Promise.all(detailedDownlinkPromises);

      const result = {
          status: true,
          creator: CREATOR,
          result: {
              title: title,
              ep_name: ep_name,
              date: date,
              description: description,
              dl_links: detailedDownlink
          }
      };

      // console.dir(result, { depth: null, colors: true });
      return result;

  } catch (error) {
      const errors = {
          status: false,
          creator: CREATOR,
          error: error.message
      };
      console.log(errors);
  }
}

  module.exports = { sinhalasubb_search, sinhalasubtv_info, sinhalasubtv_dl }
