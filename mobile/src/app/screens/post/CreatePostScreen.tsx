import { useState } from "react";
import { Alert, Button, StyleSheet, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { postsApi } from "../../services/api/posts.api";

type Props = NativeStackScreenProps<RootStackParamList, "CreatePost">;

export const CreatePostScreen = ({ navigation }: Props) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!content.trim()) {
      Alert.alert("Content is required");
      return;
    }
    try {
      setLoading(true);
      await postsApi.createPost({ content });
      navigation.goBack();
    } catch {
      Alert.alert("Post failed", "Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        multiline
        numberOfLines={5}
        maxLength={500}
        placeholder="What is on your mind?"
        value={content}
        onChangeText={setContent}
        style={styles.input}
      />
      <Button title={loading ? "Posting..." : "Post"} onPress={submit} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12
  },
  input: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top"
  }
});
