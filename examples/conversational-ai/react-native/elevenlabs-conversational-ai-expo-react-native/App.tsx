import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import { Platform } from "react-native";

import DOMComponent from "./components/ConvAI";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text>
          ElevenLabs Conversational AI with Expo React Native DOM Components!
        </Text>
        <DOMComponent
          platform={Platform.OS}
          dom={{
            style: { width: 300, height: 100 },
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
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
