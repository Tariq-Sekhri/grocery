import axios from "axios";

const appStartApi = async (device_token, session_token) => {
  try {
    const res = await axios.post(
      `http://192.168.1.109:3000/appStart?device_token=${device_token}&session_token=${session_token}`
    );
    return res;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
};

module.exports = appStartApi;
