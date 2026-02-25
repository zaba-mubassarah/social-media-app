import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { postsApi, Post } from "../../services/api/posts.api";
import { authApi } from "../../services/api/auth.api";
import { useAuthStore } from "../../store/auth-store";

type Props = NativeStackScreenProps<RootStackParamList, "Feed">;

export const FeedScreen = ({ navigation }: Props) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({});
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [usernameFilterInput, setUsernameFilterInput] = useState("");
  const [activeUsernameFilter, setActiveUsernameFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const loadFeed = useCallback(async (cursor?: string, replace = false) => {
    const { data } = await postsApi.listFeed({
      cursor,
      limit: 10,
      username: activeUsernameFilter || undefined
    });
    setPosts((prev) => (replace ? data.data : [...prev, ...data.data]));
    setNextCursor(data.nextCursor);
  }, [activeUsernameFilter]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        await loadFeed(undefined, true);
      } catch {
        Alert.alert("Feed error", "Could not load feed.");
      } finally {
        setLoading(false);
      }
    })();
  }, [loadFeed]);

  useFocusEffect(
    useCallback(() => {
      void loadFeed(undefined, true);
    }, [loadFeed])
  );

  const toggleLike = async (post: Post) => {
    try {
      const { data } = await postsApi.toggleLikePost(post._id);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === post._id
            ? { ...p, likeCount: Math.max(0, p.likeCount + (data.liked ? 1 : -1)) }
            : p
        )
      );
      setLikedPostIds((prev) => ({ ...prev, [post._id]: Boolean(data.liked) }));
    } catch {
      Alert.alert("Like action failed");
    }
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } finally {
      await clearAuth();
    }
  };

  const applyFilter = () => {
    setActiveUsernameFilter(usernameFilterInput.trim());
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Button title="Create" onPress={() => navigation.navigate("CreatePost")} />
        <Button title="Logout" onPress={logout} />
      </View>
      <View style={styles.filterRow}>
        <TextInput
          placeholder="Filter by username"
          value={usernameFilterInput}
          onChangeText={setUsernameFilterInput}
          style={styles.filterInput}
          autoCapitalize="none"
        />
        <Button title="Apply" onPress={applyFilter} />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              void loadFeed(undefined, true);
            }}
          />
        }
        onEndReached={() => {
          if (nextCursor) {
            void loadFeed(nextCursor);
          }
        }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.author}>
              {typeof item.authorId === "object" ? item.authorId.name ?? "Unknown" : "Unknown"}
            </Text>
            <Text style={styles.content}>{item.content}</Text>
            <Text style={styles.meta}>Likes: {item.likeCount}</Text>
            <Text style={styles.meta}>Comments: {item.commentCount}</Text>
            <View style={styles.row}>
              <TouchableOpacity onPress={() => void toggleLike(item)}>
                <Text style={styles.link}>{likedPostIds[item._id] ? "Unlike" : "Like"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Comments", { postId: item._id })}>
                <Text style={styles.link}>Comments</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 8 },
  topBar: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 10, alignItems: "center" },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff"
  },
  author: { color: "#1f2937", fontWeight: "700", marginBottom: 4 },
  content: { fontSize: 16, marginBottom: 8 },
  meta: { color: "#4b5563" },
  row: { flexDirection: "row", gap: 16, marginTop: 10 },
  link: { color: "#1d4ed8", fontWeight: "600" }
});
