// Starts.js
import appStartApi from "../apis/AppStartApi";
import newDeviceApi from "../apis/NewDeviceApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function starts(device, session) {
  try {
    // await clearDeviceToken();
    // await clearSessionToken();
    // await setDeviceToken("de");
    // await setSessionToken("se");
    const device_token_on_storage = await fetchDeviceToken();
    if (device_token_on_storage.isNewDevice) {
      return {
        known_device: true,
        valid_session: false,
      };
    }
    const session_token = await fetchSessionToken();
    const res = await appStartApi(device_token_on_storage.token, session_token);

    return {
      known_device: res.data.known_device,
      valid_session: res.data.valid_session,
    };
  } catch (error) {
    console.error("Error in start function:", error);
    return {
      known_device: false,
      valid_session: false,
    };
  }
}

const fetchDeviceToken = async () => {
  try {
    const token = await AsyncStorage.getItem("device_token");
    if (!token) {
      const new_device_token = await newDevice();

      return { token: new_device_token, isNewDevice: true };
    }
    return { token: token, isNewDevice: false };
  } catch (error) {
    console.error("Error fetching device token:", error);
    const new_device_token = await newDevice();

    return { token: new_device_token, isNewDevice: true };
  }
};

const fetchSessionToken = async () => {
  const token = await AsyncStorage.getItem("session_token");
  return token;
};

const setDeviceToken = async (new_device_token) => {
  await AsyncStorage.setItem("device_token", new_device_token);
};

const setSessionToken = async (new_session_token) => {
  await AsyncStorage.setItem("session_token", new_session_token);
};

const newDevice = async () => {
  const data = await newDeviceApi();
  await setDeviceToken(data.device_token);
  await clearSessionToken();
  return data.device_token;
};

const clearDeviceToken = async () => {
  try {
    await AsyncStorage.removeItem("device_token");
  } catch (error) {
    console.error("Error clearing device token:", error);
  }
};

const clearSessionToken = async () => {
  try {
    await AsyncStorage.removeItem("session_token");
  } catch (error) {
    console.error("Error clearing session token:", error);
  }
};

module.exports = starts;
