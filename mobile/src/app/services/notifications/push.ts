import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { api } from "../api/client";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export const registerForPushAndSync = async (): Promise<void> => {
  if (!Device.isDevice) {
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return;
  }

  const nativeToken = await Notifications.getDevicePushTokenAsync();
  const provider =
    nativeToken.type === "fcm"
      ? "fcm"
      : nativeToken.type === "apns"
        ? "apns"
        : "expo";

  await api.post("/users/me/device-tokens", {
    token: String(nativeToken.data),
    platform: Platform.OS,
    provider
  });
};
