// App.js
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Platform } from "react-native";
import ShoppingList from "./screens/ShoppingList";
import NotKnown from "./screens/NotKnown";
import starts from "./utils/Starts";
export default function App() {
  const [deviceInfo, setDeviceInfo] = useState({
    known_device: false,
    valid_session: false,
  });
  useEffect(() => {
    async function fetchDeivceInfo() {
      const data = await starts();
      setDeviceInfo(data);

      return data;
    }
    fetchDeivceInfo();
  }, []);

  useEffect(() => {
    console.log(deviceInfo);
  }, [deviceInfo]);

  return (
    <View>
      <Text style={styles.text}>Hello</Text>
      {deviceInfo.known_device && deviceInfo.valid_session ? (
        <ShoppingList />
      ) : (
        <NotKnown />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    marginTop: 30,
  },
});
