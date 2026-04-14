import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>Expo Template</Text>
        <Text style={styles.title}>Voice agent</Text>
        <Text style={styles.description}>
          This example runs the ElevenLabs voice stack on web via Expo Router API
          routes and WebRTC. The in-app Expo dev server does not expose those
          routes on iOS/Android. Open the same project with{" "}
          <Text style={styles.mono}>npx expo start --web</Text> to try the
          voice agent.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  eyebrow: {
    color: "#525252",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 12,
    color: "#171717",
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  description: {
    marginTop: 8,
    color: "#737373",
    fontSize: 15,
    lineHeight: 22,
  },
  mono: {
    fontFamily: "monospace",
    color: "#404040",
  },
});
