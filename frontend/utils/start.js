import appStartApi from "./apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
module.exports = start;
async function start() {
  console.log("Start caled\n");
  const device_token = await fetchDeviceToken();
  if (device_token == null) {
    await setDeviceToken();
  }
  console.log("Device token: " + device_token);

  const session_token = await fetchSessionToken();
  confirm("Session token: " + session_token);
  //   const res = await appStartApi(device_token, session_token);
  //   console.log(res);
  return {
    knownDevice: false,
    sessionToken: null,
  };
}

const fetchDeviceToken = async () => {
  console.log("Fetching device token...");
  return await AsyncStorage.getItem("device_token");
};

const fetchSessionToken = async () => {
  console.log("Fetching session token...");

  return await AsyncStorage.getItem("session_token");
};

const setDeviceToken = async () => {
  await AsyncStorage.setItem("device_token", "de");
};

const setSessionToken = async () => {
  await AsyncStorage.setItem("session_token", "se");
};
