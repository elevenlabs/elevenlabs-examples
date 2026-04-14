import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type HealthResponse = {
  ok: boolean;
  runtime: string;
};

export default function HomeScreen() {
  const [status, setStatus] = useState(
    "Tap below to confirm the server route."
  );
  const [loading, setLoading] = useState(false);

  const checkHealthRoute = useCallback(async () => {
    setLoading(true);
    setStatus("Checking /api/health...");

    try {
      const response = await fetch("/api/health");

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as HealthResponse;
      setStatus(
        data.ok
          ? `Server route ready (${data.runtime}).`
          : "Server route returned an unexpected response."
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to reach the server route."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>Expo Template</Text>
        <Text style={styles.title}>Server-ready app shell</Text>
        <Text style={styles.description}>
          Use this shared Expo Router template for ElevenLabs examples. Keep the
          base scaffold generic here, and put product-specific UI and API logic
          in each example prompt.
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={loading}
          onPress={checkHealthRoute}
          style={({ pressed }) => [
            styles.button,
            (pressed || loading) && styles.buttonPressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Check /api/health</Text>
          )}
        </Pressable>
        <Text style={styles.status}>{status}</Text>
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
  button: {
    marginTop: 24,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#171717",
    paddingHorizontal: 18,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  status: {
    marginTop: 16,
    color: "#404040",
    fontSize: 14,
    lineHeight: 20,
  },
});
