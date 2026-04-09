# Finance Me — Finance Manager & Expense Tracker

A premium-grade, fintech-style mobile application built with React Native & Expo for tracking income, expenses, and financial health.

---

## Screenshots

> Add your screenshots here after running the app.

| Auth | Home | Balances | Profile |
|------|------|----------|---------|
| Sign In / Sign Up | Dashboard + Card | Credit Score + Charts | Profile Preview/Edit |

---

## Features

### Core
- **Authentication** — Sign In / Sign Up with local persistence (no backend needed)
- **Add Transactions** — Income & expense with amount, category, date, and note
- **10 Expense Categories** — Food, Travel, Shopping, Health, Entertainment, Bills, Education, Housing, Transport, Other
- **6 Income Categories** — Salary, Freelance, Investment, Gift, Rental, Other
- **Form Validation** — Real-time error handling with shake animation
- **Monthly Summary** — Total income, expenses, and remaining balance
- **Transaction History** — Filterable by All / Income / Expense, deleteable rows
- **AsyncStorage** — All data persists locally between app sessions

### Balances
- **Animated Credit Score Gauge** — Arc chart with color-coded segments
- **Monthly Bar Chart** — 6-month income vs expense comparison
- **Category Pie Chart** — Spending breakdown by category
- **Multi-Currency Support** — USD, CAD, EUR, GBP, INR with enable/disable toggle

### Profile
- **Preview / Edit mode** — Toggle between viewing and editing
- **Update Profile** — Name, email, optional password change
- **Dark / Light Mode Toggle** — Persisted preference via AsyncStorage
- **Sign Out** — Clears auth state

### UI/UX
- **Premium Dark Theme** — Deep blacks with purple accent, green income, red expense
- **Gradient Cards** — Linear gradients on balance card, buttons, avatar
- **Micro Animations** — Spring-based FAB, button press feedback, shake on error
- **Screen Transitions** — Animated entry for all sections using Reanimated
- **Bottom Sheet Modal** — Animated add transaction panel
- **Keyboard Handling** — KeyboardAvoidingView + scroll-aware forms
- **Empty States** — Illustrated empty transaction state
- **Pull to Refresh** — Refresh animation on Home
- **Safe Area** — Full SafeAreaView support for notch/home indicator

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| **Expo SDK 51** | Build tooling, native APIs |
| **React Native** | Cross-platform mobile |
| **TypeScript** | Type safety |
| **React Navigation 6** | Stack + Bottom Tab navigation |
| **Reanimated 2** | Smooth animations |
| **Gesture Handler** | Touch handling |
| **AsyncStorage** | Local data persistence |
| **expo-linear-gradient** | Gradient cards and buttons |
| **react-native-svg** | Custom charts (gauge, bar, pie) |
| **react-native-safe-area-context** | Notch/home bar handling |
| **EAS Build** | APK / IPA delivery |

---

## Project Structure

```
FinanceMe/
├── App.tsx                          # Root entry point
├── src/
│   ├── theme/
│   │   ├── index.ts                 # Color tokens (dark + light)
│   │   └── ThemeContext.tsx         # Theme provider + toggle
│   ├── context/
│   │   ├── AuthContext.tsx          # Auth state + AsyncStorage
│   │   └── FinanceContext.tsx       # Transactions + Profile state
│   ├── types/
│   │   └── index.ts                 # TypeScript types + category definitions
│   ├── utils/
│   │   └── helpers.ts               # Formatters, ID generator, date utils
│   ├── navigation/
│   │   └── RootNavigator.tsx        # Stack + Tab navigator
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── SignInScreen.tsx
│   │   │   └── SignUpScreen.tsx
│   │   └── main/
│   │       ├── HomeScreen.tsx       # Dashboard
│   │       ├── BalancesScreen.tsx   # Charts + currencies
│   │       └── ProfileScreen.tsx    # User profile
│   └── components/
│       └── AddTransactionModal.tsx  # Bottom sheet form
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- For device testing: Expo Go app ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/FinanceMe.git
cd FinanceMe

# 2. Install dependencies
npm install

# 3. Install Expo-specific packages
npx expo install \
  react-native-reanimated \
  react-native-gesture-handler \
  @react-navigation/native \
  @react-navigation/bottom-tabs \
  @react-navigation/stack \
  react-native-screens \
  react-native-safe-area-context \
  @react-native-async-storage/async-storage \
  expo-linear-gradient \
  react-native-svg

# 4. Start the development server
npx expo start
```

### Running on Device
- Scan the QR code with **Expo Go** app
- Or press `a` for Android emulator / `i` for iOS simulator

---

## Build Delivery (APK)

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo account
eas login

# Configure EAS
eas build:configure

# Build APK for Android
eas build --platform android --profile preview
```

Add to `eas.json`:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

The APK download link will be provided by EAS after the build completes.

---

## Design Decisions

### Why custom SVG charts instead of a library?
The built-in `react-native-svg` approach keeps bundle size minimal and gives full control over styling to match the premium theme. No extra native dependencies.

### Why Context API instead of Redux/Zustand?
The app's state is simple (2 contexts: Auth + Finance). Context API with `useCallback` memoization is more than sufficient and keeps the codebase lean.

### Why AsyncStorage without a DB?
Per the assignment: no backend required. AsyncStorage with JSON serialization handles the data volume of a personal finance app cleanly. If needed, it can be swapped for WatermelonDB or SQLite.

---

## Bonus Features Implemented
- [x] Animated pie chart (spending by category)
- [x] Animated bar chart (6-month overview)  
- [x] Animated credit score gauge
- [x] Smart empty states
- [x] Pull-to-refresh
- [x] Dark/Light mode with persistence
- [x] Transaction filter (All / Income / Expense)
- [x] Category color coding with icons

---

## License
MIT
