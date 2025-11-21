const axios = require('axios');
const cheerio = require('cheerio');

async function gettep(animeUrl) {
  try {
    const response = await axios.get(animeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://animeheaven.me/',
      }
    });
    const $ = cheerio.load(response.data);

    const result = {
      title: $('.infotitle.c').text().trim(),
      image: $('.infoimg img').attr('src'),
      date: $('.infoyear.c > div').eq(1).text(),
      episodes: $('.infoyear.c > div').eq(0).text(),
      imdb: $('.infoyear.c > div').eq(2).text(),
    };

    const baseUrl = 'https://animeheaven.me/';
    const episodes = [];

    $('.linetitle2.c2 a').each((i, el) => {
      const id = $(el).attr('id');
      const episode = $(el).find('.watch2.bc').text().trim();

      if (id && episode) {
        const url = `${baseUrl}gate.php?id=${id}`;
        episodes.push({ episode, url, id });
      }
    });

    return { result, results: episodes };
  } catch (error) {
    console.error('Error fetching episode data:', error.message);
    throw new Error('Failed to scrape the website');
  }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function down(gateUrl) {
  try {
    const response = await axios.get(gateUrl, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        // Replace below with your actual cookie string, keep it secure!
        'Cookie': 'popcashpu=1; a=fsgR7WmRm3yFVSyuDCEAT38E8guVLL06; _popprepop=1; key=18d72b1fe33e625cc1d81013787c7e2a; token_QpUJAAAAAAAAGu98Hdz1l_lcSZ2rY60Ajjk9U1c=your_full_token_here',
        'Host': 'animeheaven.me',
        'Referer': 'https://animeheaven.me/',
        'Sec-Ch-Ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
      },
      decompress: true,
    });

    const $ = cheerio.load(response.data);
    const downloadUrl = $('a:contains("Download Episode")').attr('href');

    if (downloadUrl && downloadUrl.startsWith('http')) {
      return downloadUrl;
    } else {
      console.warn('Download link not found or malformed.');
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch download link:', error.response?.status || error.message);
    throw new Error('Download link retrieval failed.');
  }
}



module.exports = {
  
  gettep,
  down,
  
};



