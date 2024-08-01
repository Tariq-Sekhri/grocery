import axios from "axios";

const newDeviceApi = async () => {
  try {
    const res = await axios.post(`http://192.168.1.109:3000/newDevice`);
    return res.data;
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 200 range
      console.error("API call error:", error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error("API call error: No response received", error.request);
    } else {
      // Something else happened while setting up the request
      console.error("API call error:", error.message);
    }
    throw error;
  }
};

module.exports = newDeviceApi;
