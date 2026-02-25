import admin from "firebase-admin";
import { env } from "../../config/env";

let initialized = false;

const initFirebase = (): void => {
  if (initialized) {
    return;
  }

  if (!env.FCM_PROJECT_ID || !env.FCM_CLIENT_EMAIL || !env.FCM_PRIVATE_KEY) {
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FCM_PROJECT_ID,
      clientEmail: env.FCM_CLIENT_EMAIL,
      privateKey: env.FCM_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
  });
  initialized = true;
};

export const sendPush = async (params: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<void> => {
  initFirebase();
  if (!initialized) {
    return;
  }

  await admin.messaging().send({
    token: params.token,
    notification: {
      title: params.title,
      body: params.body
    },
    data: params.data
  });
};
