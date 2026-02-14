# Masakin Mobile App

A mobile application for the social cooking platform "Masakin" - **Solusi sebelum kamu pesan online**.

## Features

- 🔐 User authentication (Login/Register)
- 📱 Recipe feed with search, filters, and pagination
- 📖 Detailed recipe view with reactions and comments
- ➕ Create and publish recipes with images
- 👤 User profiles with follow functionality
- 🔖 Save favorite recipes
- 👨‍🍳 Cook Mode for step-by-step cooking
- 📤 Share recipes

## Tech Stack

- React Native (Expo)
- React Navigation
- Axios
- AsyncStorage
- Context API
- Expo Image Picker

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):

   ```bash
   cp .env.example .env
   ```

4. Update the API base URL in `.env`:
   ```
   API_BASE_URL=http://your-api-url/api/v1
   ```

## Running the App

### Development

Start the Expo development server:

```bash
npx expo start
```

Then choose:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

### Build for Production

```bash
# iOS
npx expo build:ios

# Android
npx expo build:android
```

## Project Structure

```
src/
├── screens/          # App screens
├── components/       # Reusable components
├── navigation/       # Navigation setup
├── context/          # Context providers
├── services/         # API services
├── hooks/           # Custom hooks
└── utils/           # Utilities and theme
```

## Environment Variables

- `API_BASE_URL` - Backend API base URL

## API Integration

The app integrates with the Masakin backend API at `/api/v1`. Ensure the backend is running and accessible.

### Key Endpoints

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /recipes` - Get recipe list
- `GET /recipes/:id` - Get recipe details
- `POST /recipes` - Create recipe
- `POST /recipes/:id/react` - React to recipe
- `POST /recipes/:id/comments` - Add comment

## Features in Detail

### Authentication

- Secure JWT-based authentication
- Auto-login on app start
- Persistent user sessions

### Recipe Feed

- Infinite scroll pagination
- Search by title
- Category filters
- Sort by latest/trending
- Pull-to-refresh

### Recipe Details

- Image gallery
- Reactions (like, love, wow)
- Save/unsave recipes
- Comment section
- Share functionality
- Cook Mode

### Create Recipe

- Image upload (multiple)
- Dynamic ingredient inputs
- Dynamic step inputs
- Category and difficulty selection
- Draft/publish toggle

### Profile

- View user stats
- Follow/unfollow users
- My recipes tab
- Saved recipes tab

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

MIT
