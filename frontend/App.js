// App.js
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Platform } from "react-native";
import ShoppingList from "./screens/ShoppingList";
import NotKnown from "./screens/NotKnown";
import start from "./utils/start";
export default function App() {
  const [deviceInfo, setDeviceInfo] = useState({
    knownDevice: false,
    sessionToken: null,
  });
  useEffect(() => {
    async function fetchDeivceInfo() {
      return await start();
    }
    fetchDeivceInfo();
  }, []);
  // useEffect(() => {
  // console.log(deviceInfo);
  // }, [deviceInfo]);
  return (
    <View>
      <Text style={styles.text}>Hello</Text>
      {deviceInfo.knownDevice ? <ShoppingList /> : <NotKnown />}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    marginTop: 30,
  },
});
