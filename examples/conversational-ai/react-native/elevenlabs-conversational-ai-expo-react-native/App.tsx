import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import { Platform } from "react-native";
import tools from "./utils/tools";

import ConvAiDOMComponent from "./components/ConvAI";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text>
          ElevenLabs Conversational AI with Expo React Native DOM Components!
        </Text>
        <ConvAiDOMComponent
          platform={Platform.OS}
          get_battery_level={tools.get_battery_level}
          change_brightness={tools.change_brightness}
          flash_screen={tools.flash_screen}
          dom={{
            style: { width: 300, height: 300 },
          }}
        />
        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  content: {
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
