const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const imgbbUrl = "https://imgbb.com/";
const uploadUrl = "https://imgbb.com/json";
const maxFileSize = 32 * 1024 * 1024; // 32MB

// 🔹 Fetch auth token from imgbb page
async function fetchAuthToken() {
  try {
    const response = await axios.get(imgbbUrl);
    const html = response.data;

    const match = html.match(/PF\.obj\.config\.auth_token="([a-f0-9]{40})"/);

    if (match && match[1]) {
      return match[1];
    }
    throw new Error("Auth token not found");
  } catch (err) {
    console.error("Error fetching auth token:", err.message);
    throw err;
  }
}

// 🔹 Upload image file → get public URL
async function image2url(filePath) {
  try {
    const fileStat = fs.statSync(filePath);

    if (fileStat.size > maxFileSize) {
      return { error: "File size exceeds 32MB limit" };
    }

    const authToken = await fetchAuthToken();

    const form = new FormData();
    form.append("source", fs.createReadStream(filePath));
    form.append("type", "file");
    form.append("action", "upload");
    form.append("timestamp", Date.now());
    form.append("auth_token", authToken);

    const response = await axios.post(uploadUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    if (response.data) {
      return {
        status: true,
        creator: "Themi Sadas",
        result: response.data.image,
      };
    } else {
      return { error: "Upload failed, no response data" };
    }
  } catch (err) {
    console.error("Error uploading file:", err.message);
    return { error: err.message };
  }
}

module.exports = { image2url };
