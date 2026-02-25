import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/auth-store";
import { FeedScreen } from "../screens/feed/FeedScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { CreatePostScreen } from "../screens/post/CreatePostScreen";
import { CommentsScreen } from "../screens/post/CommentsScreen";
import { registerForPushAndSync } from "../services/notifications/push";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Feed: undefined;
  CreatePost: undefined;
  Comments: { postId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const hydrated = useAuthStore((s) => s.hydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (accessToken) {
      void registerForPushAndSync();
    }
  }, [accessToken]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!accessToken ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Feed" component={FeedScreen} />
          <Stack.Screen name="CreatePost" component={CreatePostScreen} />
          <Stack.Screen name="Comments" component={CommentsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
