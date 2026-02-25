import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { Comment, postsApi } from "../../services/api/posts.api";

type Props = NativeStackScreenProps<RootStackParamList, "Comments">;

export const CommentsScreen = ({ route }: Props) => {
  const { postId } = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const { data } = await postsApi.listComments(postId, { limit: 20 });
    setComments(data.data);
  }, [postId]);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        await load();
      } catch {
        Alert.alert("Could not load comments");
      } finally {
        setLoading(false);
      }
    })();
  }, [postId, load]);

  const add = async () => {
    if (!text.trim()) {
      return;
    }
    try {
      const trimmed = text.trim();
      setText("");
      const optimistic: Comment = {
        _id: `temp-${Date.now()}`,
        postId,
        userId: "me",
        text: trimmed,
        createdAt: new Date().toISOString()
      };
      setComments((prev) => [optimistic, ...prev]);
      const { data } = await postsApi.addComment(postId, trimmed);
      setComments((prev) => [data, ...prev.filter((c) => c._id !== optimistic._id)]);
    } catch {
      await load();
      Alert.alert("Failed to add comment");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      void load();
    }, 5000);

    return () => clearInterval(timer);
  }, [postId]);

  return (
    <View style={styles.container}>
      <View style={styles.composer}>
        <TextInput
          placeholder="Write a comment..."
          value={text}
          onChangeText={setText}
          style={styles.input}
        />
        <Button title="Send" onPress={() => void add()} />
      </View>

      <FlatList
        data={comments}
        refreshing={loading}
        onRefresh={() => void load()}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.text}</Text>
            <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  composer: { flexDirection: "row", gap: 8, marginBottom: 10, alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  item: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8
  },
  meta: {
    marginTop: 6,
    color: "#6b7280",
    fontSize: 12
  }
});
