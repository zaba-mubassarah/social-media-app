# Mini Social Feed App

Submission-ready full-stack project with:
- Backend: Node.js, Express, MongoDB, JWT, Firebase Cloud Messaging (FCM)
- Mobile: React Native (Expo), authentication, feed, create post, like/comment, push handling

## Repository Structure

```txt
backend/
mobile/
.github/workflows/ci.yml
README.md
```

## Features

- Signup/Login with JWT
- Create text-only posts
- Paginated feed (newest first)
- Like/unlike posts
- Comment on posts
- Filter feed by username
- Notification outbox worker and FCM send for like/comment events

## Backend Setup

1. Install and configure MongoDB.
2. Create backend env:
```bash
cd backend
cp .env.example .env
```
3. Fill required values in `backend/.env`:
- `HOST=0.0.0.0`
- `PORT=5000`
- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `FCM_PROJECT_ID`
- `FCM_CLIENT_EMAIL`
- `FCM_PRIVATE_KEY` (escaped with `\n`)
4. Run backend:
```bash
npm install
npm run dev
```
5. Health:
- `GET http://localhost:5000/health`

## Mobile Setup (Expo)

1. Create mobile env (optional override):
```bash
cd mobile
cp .env.example .env
```
2. If testing from physical phone, set:
```env
EXPO_PUBLIC_API_BASE_URL=http://<your-laptop-ip>:5000/v1
```
3. Install and run:
```bash
npm install
npx expo start -c --lan
```

## API Documentation

### Auth
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`

### Posts
- `POST /v1/posts`
- `GET /v1/posts?limit=10&cursor=...&username=...`
- `POST /v1/posts/:postId/like` (toggle)
- `PUT /v1/posts/:postId/like`
- `DELETE /v1/posts/:postId/like`

### Comments
- `POST /v1/posts/:postId/comment`
- `POST /v1/posts/:postId/comments`
- `GET /v1/posts/:postId/comments?limit=20&cursor=...`

### Device Token Registration
- `POST /v1/users/me/device-tokens`
- Body:
```json
{
  "token": "device-token",
  "platform": "android",
  "provider": "fcm"
}
```

## FCM Notes

- Backend sends notifications through Firebase Admin SDK.
- Add Firebase service-account values to backend `.env`.
- Mobile app sends native device push token to backend.
- For production-grade iOS/Android push behavior, use an EAS dev build or release build.

## Build APK (Deliverable)

This repo includes `mobile/eas.json` with an APK profile.

1. Install/login:
```bash
npm install -g eas-cli
cd mobile
eas login
```
2. Configure once:
```bash
eas build:configure
```
3. Build APK:
```bash
eas build --platform android --profile preview
```
4. Download APK from EAS build URL.

## GitHub + Submission Steps

1. Initialize/push repo:
```bash
git init
git add .
git commit -m "Mini Social Feed delivery"
git branch -M main
git remote add origin <your-github-url>
git push -u origin main
```
2. Upload APK to Google Drive and enable link sharing.
3. Submit:
- GitHub repo URL
- Google Drive APK URL
