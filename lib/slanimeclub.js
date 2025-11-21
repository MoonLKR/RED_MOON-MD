const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require('cheerio');
const urlModule = require('url'); // To help handle relative URLs
const axios = require('axios');
async function slanimeclub_search(url) {
  try {
    // Ensure the URL is absolute.
    const baseUrl = `https://slanimeclub.co/tvshows/?s=${url}`; // Replace with the actual base URL if necessary
   

    const response = await fetch(baseUrl);
    const body = await response.text();
    const $ = cheerio.load(body);

    const result = [];
    $("div.module > div.content.rigth.csearch > div > div > article").each((_, element) => {
      result.push({
        title: $(element).find("div.title > a").text().replace(/\n/g, '').trim(),
        image: $(element).find("img").attr("src"),
        imdb: $(element).find("div.meta > span.rating").text().trim(),
        year: $(element).find("div.meta > span.year").text().trim(),
        link: $(element).find("div.title > a").attr("href"),
        short_desc: $(element).find("div.contenido > p").text().trim(),
      });
    });

      return {
      status: true,
      creater: '@Darksadas-YT',
      
      data: result,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { error: 'Failed to scrape data' };
  }
}

//====================================================================================================================

async function slanimeclub_ep(url) {
    try {
        const response = await fetch(url);
        const body = await response.text();
        const $ = cheerio.load(body);

        const cast = [];
        $("#cast > div.persons:nth-child(4) > div").each((i, el) => {
            const name = $(el).find("meta").attr("content");
            const link = $(el).find("div > a").attr("href");
            cast.push({ name, link });
        });

        const title = $("#single > div.content.right > div.sheader > div.data > h1").text();
        const first_air_date = $("#single > div.content.right > div.sheader > div.data > div.extra > span.date").text();
        const last_air_date = $("#info > div:nth-child(6) > span").text();
        const categorydata = $("#single > div.content.right > div.sheader > div.data > div.sgeneros > a").text().trim();
        const category = categorydata.match(/([A-Z][a-z]+|\d+\+?)/g);
        const episode_count = $("#info > div:nth-child(9) > span").text();
        const duration = $("#single > div.content.right > div.sheader > div.data > div.extra > span.runtime").text();
        const movie_link = $("#single > div.content.right > div.dt-breadcrumb.breadcrumb_bottom > ol > li > li > a").attr("href");
        const tmdbRate = $("#repimdb > strong").text();
        const tmdbv = $("#repimdb").text().trim();
        const tmdbVoteCount = tmdbv.replace(tmdbRate + ' ', '').replace(' votes', '');
        const mainImage = $("#single > div.content.right > div.sheader > div.poster > img").attr("src");
        const image = $("#info > div > span > p > img").attr("src");
        const director = $("#cast > div > div > meta").attr("content");

        const episodes = [];
        $("#seasons > div > div.se-a > ul > li").each((i, el) => {
            const number = $(el).find("div.numerando").text();
            const name = $(el).find("div.episodiotitle > a").text();
            const link = $(el).find("div.episodiotitle > a").attr("href");
            const date = $(el).find("div.episodiotitle > span").text();
            const image = $(el).find("div > img").attr("src");
            episodes.push({ number, name, date, image, link });
        });

        const result = {
           
                title: title,
                first_air_date: first_air_date,
                last_air_date: last_air_date,
                category: category,
                movie_link: url,
                mainImage: mainImage || "",
                image: image || "",
                tmdbRate: tmdbRate,
                tmdbVoteCount: tmdbVoteCount,
                director: director,
                cast: cast,
                episode_count: episodes.length,
                episodes: episodes
           
        };

        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
        return { error: 'Failed to scrape data' };
    }
}

//======================================================================================================================

async function slanimeclub_dl(url) {
  try {
    const response = await fetch(url); // Fetch the webpage content
    const body = await response.text(); // Get the HTML body

    const $ = cheerio.load(body); // Load the HTML into cheerio for parsing

    const downloadLinks = []; // Array to hold download links

    // Iterate through the table rows to get download links
    $("div > div > table > tbody > tr").each((_, element) => {
      const quality = $(element).find("td > a > strong").text().trim();
      const size = $(element).find("td").eq(1).text().trim();
      const downloadLinkOut = $(element).find("td > a").attr("href");

      // If a valid download link is found, push it into the array
      if (downloadLinkOut) {
        downloadLinks.push({
          quality: quality,
          size: size,
          link: downloadLinkOut,
        });
      }
    });

    // Now let's fetch additional details for each link
    const detailedDownlinkPromises = downloadLinks.map(async (item) => {
      try {
        const detailPage = await axios.get(item.link);  // Fetch the detail page for the link
        const $detail = cheerio.load(detailPage.data);  // Parse the detail page with cheerio
        const detailLink = $detail("#link").attr("href")?.trim();  // Get the link from the detail page
        
        return { ...item, detailLink };  // Return the item with the additional detailLink
      } catch (error) {
        console.error(`Error fetching details for link ${item.link}: ${error.message}`);
        return null; // If error occurs, return null
      }
    });

    const detailedDownlink = await Promise.all(detailedDownlinkPromises);  // Wait for all the promises to resolve

    // Filter out null values (in case any failed)
    const filteredDownlink = detailedDownlink.filter(item => item !== null);

    return filteredDownlink;  // Return the detailed download links
  } catch (error) {
    console.error('Error fetching data:', error);  // Handle any errors in the try block
  }
}


//====================================================================================================

async function slanimeclub_mv_search(url) {
  try {
    // Ensure the URL is absolute.
    const baseUrl = `https://slanimeclub.co/movies/?s=${url}`; // Replace with the actual base URL if necessary
   

    const response = await fetch(baseUrl);
    const body = await response.text();
    const $ = cheerio.load(body);

    const result = [];
    $("div.module > div.content.rigth.csearch > div > div > article").each((_, element) => {
      result.push({
        title: $(element).find("div.title > a").text().replace(/\n/g, '').trim(),
        image: $(element).find("img").attr("src"),
        imdb: $(element).find("div.meta > span.rating").text().trim(),
        year: $(element).find("div.meta > span.year").text().trim(),
        link: $(element).find("div.title > a").attr("href"),
        short_desc: $(element).find("div.contenido > p").text().trim(),
      });
    });

      return {
      status: true,
      creater: '@Darksadas-YT',
      
      data: result,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { error: 'Failed to scrape data' };
  }
}

//====================================================================================================================

async function slanime_mv_info(url) {
  try {
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(html);

    const result = {};
    result.title = $("#single > div.content.right > div.sheader > div.data > h1").text().trim();
    result.image = $("div.content.right > div.sheader > div.poster > img").attr("src");
    result.genres = $("div.sgeneros > a").map((i, el) => $(el).text().trim()).get();
    result.date = $("span.date").first().text().trim();
    result.country = $("span.country").text().trim();
    result.runtime = $("span.runtime").text().trim();
    result.desc = $("#info > div.wp-contentneww > p:nth-child(3)").first().text().trim();
    result.subtitle_author = $("#info > div.custom_fields1 > span.valor1").next().text().trim();
    result.imdb = $("#repimdb > span.rating-number").text().trim();

    // Step 1: Parse download links from #download table
    let dl_links = [];
    $('#download table tbody tr').each((i, el) => {
      const row = $(el);
      const link = row.find('td').eq(0).find('a').attr('href') || null;
      const quality = row.find('td').eq(1).find('strong.quality').text().trim() || null;
      const size = row.find('td').eq(2).text().trim() || null;
      const clicks = row.find('td').eq(3).text().trim() || null;

      if (link) {
        dl_links.push({ link, quality, size, clicks });
      }
    });

    // Step 2: If none found, fallback to iruPCMInfo (optional, same as before)
    if (dl_links.length === 0) {
      const match = html.match(/iruPCMInfo\s*=\s*(\{[\s\S]*?\});/);
      if (match) {
        try {
          const objCode = match[0];
          const sandbox = {};
          vm.createContext(sandbox);
          vm.runInContext(objCode, sandbox);
          const iruPCMInfo = sandbox.iruPCMInfo;

          if (Array.isArray(iruPCMInfo?.dlList) && iruPCMInfo.dlList.length > 0) {
            iruPCMInfo.dlList.forEach(item => {
              let cleanLink = null;
              if (Array.isArray(item.dlLink)) {
                cleanLink = item.dlLink.find(l => l && l.startsWith("http") && !l.includes("t.me"));
              } else if (typeof item.dlLink === "string" && item.dlLink.startsWith("http")) {
                cleanLink = item.dlLink;
              }
              if (cleanLink) {
                dl_links.push({
                  link: cleanLink,
                  quality: item.resolution || null,
                  size: item.size || null,
                  language: item.lang || null,
                });
              }
            });
          }
        } catch (err) {
          console.warn('⚠️ Error parsing iruPCMInfo:', err.message);
        }
      }
    }

    // Step 3: For each link, fetch the detail page and get real download URL from #link href
    const detailedDlLinks = await Promise.all(
      dl_links.map(async item => {
        try {
          const detailPage = await axios.get(item.link, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          const $detail = cheerio.load(detailPage.data);
          const realLink = $detail("#link").attr("href")?.trim() || item.link;
          return { ...item, link: realLink };
        } catch {
          return item; // fallback to original link on error
        }
      })
    );

    return {
      status: detailedDlLinks.length > 0,
      creator: CREATOR,
      data: result,
      dl_links: detailedDlLinks,
      message: detailedDlLinks.length > 0 ? 'Download links found.' : 'No download links found.',
    };
  } catch (error) {
    return {
      status: false,
      message: 'Failed to scrape data.',
      error: error.message,
    };
  }
}










module.exports = { slanimeclub_search, slanimeclub_ep, slanimeclub_dl, slanimeclub_mv_search, slanime_mv_info }
