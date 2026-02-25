import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import { authApi } from "../../services/api/auth.api";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useAuthStore } from "../../store/auth-store";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export const RegisterScreen = ({ navigation }: Props) => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      const { data } = await authApi.register({ name, email, password });
      await setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const payload = error.response?.data as
          | {
              message?: string;
              errors?: {
                fieldErrors?: Record<string, string[]>;
              };
            }
          | undefined;

        const fieldErrors = payload?.errors?.fieldErrors
          ? Object.entries(payload.errors.fieldErrors)
              .map(([field, values]) => `${field}: ${(values ?? []).join(", ")}`)
              .join("\n")
          : undefined;

        const message =
          fieldErrors ??
          payload?.message ??
          (typeof error.response?.data === "string" ? error.response.data : undefined) ??
          (error.code === "ECONNABORTED"
            ? "Request timed out. Check network and backend URL."
            : undefined) ??
          "Request failed. Check backend reachability and inputs.";

        Alert.alert(`Registration failed (${error.response?.status ?? "network"})`, message);
        return;
      }

      Alert.alert("Registration failed", "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput
        autoCapitalize="none"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        secureTextEntry
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button title={loading ? "Please wait..." : "Register"} onPress={submit} disabled={loading} />
      <Button title="Back to login" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
    justifyContent: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10
  }
});
