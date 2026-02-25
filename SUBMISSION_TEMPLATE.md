## Mini Social Feed App Submission

### GitHub Repository
`<PASTE_GITHUB_REPO_URL>`

### APK Download (Google Drive)
`<PASTE_GOOGLE_DRIVE_APK_LINK>`

### Quick Run Notes
1. Backend:
   - `cd backend`
   - `cp .env.example .env`
   - set MongoDB + JWT + FCM env vars
   - `npm install && npm run dev`
2. Mobile:
   - `cd mobile`
   - set `EXPO_PUBLIC_API_BASE_URL` in `.env` (if using physical device)
   - `npm install && npx expo start -c --lan`

### Implemented Scope
- JWT authentication
- Create post
- Paginated feed
- Like/unlike
- Comment
- FCM notification workflow for likes/comments

