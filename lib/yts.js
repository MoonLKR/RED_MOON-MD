const axios = require('axios');
const cheerio = require('cheerio');


async function ApiReq(data, url) {
    try {
        const res = await axios.post(url, data, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "PostmanRuntime/7.42.2"
            }
        });
        return res;
    } catch (error) {
        console.error('Error making the request:', error);
    }
}

async function download(query) {
    try {
        const direct = { direct: true };
        const mega = { mega: true };
        const gdrive = { gdrive: true };
        let link = query;

            const replacements = [
              ['https://google.com/server5/1:/', 'https://drive2.cscloud12.online/server5/'],   
            ['https://google.com/server4/1:/', 'https://drive2.cscloud12.online/server4/'],
            ['https://google.com/server3/1:/', 'https://drive2.cscloud12.online/server3/'],
            ['https://google.com/server21/1:/', 'https://drive2.cscloud12.online/server2/'],
            ['https://google.com/server22/1:/', 'https://drive2.cscloud12.online/server2/'],
            ['https://google.com/server23/1:/', 'https://drive2.cscloud12.online/server2/'],
            ['https://google.com/server11/1:/', 'https://drive2.cscloud12.online/server1/'],
            ['https://google.com/server12/1:/', 'https://drive2.cscloud12.online/server1/'],
            ['https://google.com/server13/1:/', 'https://drive2.cscloud12.online/server1/']
        ];

        for (const [oldLink, newLink] of replacements) {
            if (query.includes(oldLink)) {
                link = query.replace(oldLink, newLink);
                break;
            }
        }

        const formatReplacements = [
            ['.mp4?bot=cscloud2bot&code=', '?ext=mp4&bot=cscloud2bot&code='],
            ['.mp4', '?ext=mp4'],
            ['.mkv?bot=cscloud2bot&code=', '?ext=mkv&bot=cscloud2bot&code='],
            ['.mkv', '?ext=mkv'],
            ['.zip', '?ext=zip']
        ];

        for (const [oldFormat, newFormat] of formatReplacements) {
            if (link.includes(oldFormat)) {
                link = link.replace(oldFormat, newFormat);
            }
        }

        const response = await ApiReq(direct, link);
        const response2 = await ApiReq(gdrive, link);
        const response3 = await ApiReq(mega, link);

        const result = {
            result: {
               
                direct: response.data.url
                
            }
        };

     
        return result;
    } catch (error) {
        console.error({
            status: false,
            error: error.message
        });
        return { status: false, error: error.message };
    }
}

module.exports = download;
