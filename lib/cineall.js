const axios = require('axios');
const cheerio = require('cheerio');
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const vm = require('vm');
const CREATOR = "@Darksadas-YT"



// Scraping funjcftion
async function cinesubz_info(url) {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(html);

    // Scrape metadata
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

    let dl_links = [];

    // METHOD 1: Try iruPCMInfo JavaScript variable
    const match = html.match(/iruPCMInfo\s*=\s*(\{[\s\S]*?\});/);
    if (match) {
      try {
        const objCode = match[0];
        const sandbox = {};
        vm.createContext(sandbox);
        vm.runInContext(objCode, sandbox);
        const iruPCMInfo = sandbox.iruPCMInfo;

        if (Array.isArray(iruPCMInfo?.dlList) && iruPCMInfo.dlList.length > 0) {
          dl_links = iruPCMInfo.dlList.map(item => {
            let cleanLink = null;

            // Handle array or string type dlLink
            if (Array.isArray(item.dlLink)) {
              cleanLink = item.dlLink.find(
                l => l && l.startsWith("http") && !l.includes("t.me")
              );
            } else if (typeof item.dlLink === "string" && item.dlLink.startsWith("http")) {
              cleanLink = item.dlLink;
            }

            return {
              quality: item.resolution || null,
              size: item.size || null,
              language: item.lang || null,
              link: cleanLink || null,
            };
          }).filter(link => link.link); // Remove null/invalid links
        }
      } catch (err) {
        console.warn('⚠️ Error parsing iruPCMInfo:', err.message);
      }
    }

    // METHOD 2: Fallback table scrape
    if (dl_links.length === 0) {
      const downlink = [];

      $("table tbody tr.clidckable-rowdd").each((i, el) => {
        const quality = $(el).find("td").eq(0).text().trim();
        const size = $(el).find("td").eq(1).text().trim();
        const language = $(el).find("td").eq(2).text().trim();
        const link = $(el).attr("data-href");
        if (link) {
          downlink.push({ quality, size, language, link });
        }
      });

      if (downlink.length > 0) {
        const detailedDownlink = await Promise.all(
          downlink.map(async item => {
            try {
              const detailPage = await axios.get(item.link, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
              });
              const $detail = cheerio.load(detailPage.data);
              const realLink = $detail("#link").attr("href")?.trim() || item.link;
              return { ...item, link: realLink };
            } catch {
              return item;
            }
          })
        );

        return {
          status: true,
          creator: CREATOR,
          data: result,
          dl_links: detailedDownlink.filter(l => l.link && l.link.startsWith("http")),
        };
      }
    }

    // Final return
    if (dl_links.length > 0) {
      return {
        status: true,
        creator: CREATOR,
        data: result,
        dl_links,
      };
    }

    return {
      status: false,
      message: 'No download links found.',
      data: result,
      dl_links: [],
    };
  } catch (error) {
    return {
      status: false,
      message: 'Failed to scrape data.',
      error: error.message,
    };
  }
}
//===============================================================================================================

async function cinesubz_tvshow_info(query) {
    try {
        const https = /^https:\/\/[^\s/$.?#].[^\s]*$/;
        if (!query || !https.test(query)) {
            console.log("Invalid URL. Please provide a valid HTTPS URL.");
            console.log("මොකක්ද මනුස්සයෝ කරන්නෙ cinesubz.co TVSHOW URL එකක් දාපන්");
            return;
        }

          const response = await fetch(query); // Replace with the actual URL if needed
    const body = await response.text();

    const $ = cheerio.load(body);
        const cast = [];

        $("#cast > div.persons:nth-child(4) > div").each((i, el) => {
            const name = $(el).find("meta").attr("content");
            const link = $(el).find("div > a").attr("href");
            cast.push({name, link})
        })
    

        const title = $("#single > div.content.right > div.sheader > div.data > h1").text();
        const first_air_date = $("#single > div.content.right > div.sheader > div.data > div.extra > span.date").text();
        const last_air_date = $("#info > div:nth-child(6) > span").text();
        const categorydata = $("#single > div.content.right > div.sheader > div.data > div.sgeneros > a").text().trim();
        const category = categorydata.match(/([A-Z][a-z]+|\d+\+?)/g);
        const episode_count = $("#info > div:nth-child(9) > span").text();
        const duration = $("#single > div.content.right > div.sheader > div.data > div.extra > span.runtime").text();
        const movie_link = $("#single > div.content.right > div.dt-breadcrumb.breadcrumb_bottom > ol > li > li > a").attr("href");
        const tmdbRate = $("#repimdb > strong").text();
        const tmdbv = $("#repimdb").text().trim()
        const tmdbv2 = tmdbv.replace(tmdbRate+' ', '')
        const tmdbVoteCount = tmdbv2.replace(' votes', '')
        const mainImage = $("#single > div.content.right > div.sheader > div.poster > img").attr("src");
        const image = $("#info > div > span > p > img").attr("src")
        const director = $("#cast > div > div > meta").attr("content");


        const episodes = [];
$("ul.episodios > li").each((i, el) => {
    const number = $(el).find("div.numerando").text().trim(); // eg: S01 E01
    const name = $(el).find("div.episodiotitle").clone().children().remove().end().text().trim(); // eg: Episode 1
    const link = $(el).find("a.episode-link").attr("href");
    const date = $(el).find("div.episodiotitle > span.date").text().trim(); // eg: Apr. 18, 2025
    const image = $(el).find("div.imagen img").attr("src");

    episodes.push({ number, name, date, image, link });
});
    

        const result = {
            data: {
                title: title,
                first_air_date: first_air_date,
                last_air_date: last_air_date,
                category: category,
                movie_link: query,
                mainImage: mainImage || "",
                image: image || "",
                tmdbRate: tmdbRate,
                tmdbVoteCount: tmdbVoteCount,
                director: director,
                cast: cast,
                episode_count: episodes.length,
                episodes: episodes

            }
        };

        // console.dir(result, { depth: null, colors: true });
        return result

    } catch (error) {
        const errors = {
            status: false,
            creator: CREATOR,
            error: error.message
        };
        console.log(errors);
    }
}

//==========================================================================================================


async function cinesubz_tv_firstdl(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const $ = cheerio.load(data);
        let downlink = [];

        // ✅ First attempt using strict selector
        try {
            $('table tbody tr.clidckable-rowdd').each((i, el) => {
                const quality = $(el).find('td:nth-child(1)').text().trim();
                const size = $(el).find('td:nth-child(2)').text().trim();
                const link = $(el).attr('data-href')?.trim();

                if (link) {
                    downlink.push({ quality, size, link });
                }
            });
        } catch (e) {
            console.warn("⚠️ Error in primary selector:", e.message);
        }

        // ✅ If downlink is empty, try fallback selector
        if (downlink.length === 0) {
            console.log("⚠️ Primary selector returned no results, trying fallback...");
            $('tr.clidckable-rowdd').each((i, el) => {
                const quality = $(el).find('td').eq(0).text().trim();
                const size = $(el).find('td').eq(1).text().trim();
                const type = $(el).find('td').eq(2).text().trim();
                const link = $(el).attr('data-href')?.trim();

                if (link) {
                    downlink.push({ quality, size, type, link });
                }
            });
        }

        // ❌ Still empty?
        if (downlink.length === 0) {
            return {
                status: false,
                message: 'No download links found with both selectors.'
            };
        }

        // ✅ Now fetch each detail page to get the direct download link
        const detailedDownlink = await Promise.all(
            downlink.map(async (item) => {
                try {
                    const detailPage = await axios.get(item.link, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0'
                        }
                    });
                    const $detail = cheerio.load(detailPage.data);
                    const direct_link = $detail('#link').attr('href')?.trim();
                    return { ...item, direct_link };
                } catch (error) {
                    console.error(`❌ Error fetching detail for ${item.link}:`, error.message);
                    return { ...item, direct_link: null };
                }
            })
        );

        return {
            status: true,
            creator: CREATOR,
            dl_links: detailedDownlink
        };

    } catch (err) {
        console.error("❌ Main error:", err.message);
        return {
            status: false,
            message: 'Failed to fetch or parse the page.',
            error: err.message
        };
    }
}





  module.exports = { cinesubz_info, cinesubz_tv_firstdl, cinesubz_tvshow_info }
