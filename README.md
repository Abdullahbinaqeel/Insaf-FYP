# INSAF - Legal Services Marketplace

**INSAF** (Justice) is a mobile application designed to bridge the gap between citizens seeking legal assistance and qualified lawyers. It serves as a comprehensive marketplace for legal cases, offering features like lawyer verification, case bidding, AI-powered legal assistance, and secure case management.

## 📱 Features

### For Clients
*   **Post Cases:** detailed case submission with budget and area of law.
*   **Find Lawyers:** Browse verified lawyer profiles, filter by specialization.
*   **AI Law Coach:** Chat with an AI assistant for initial legal guidance.
*   **Book Consultations:** Schedule video/audio appointments.
*   **Secure Hiring:** Review bids and hire lawyers directly.

### For Lawyers
*   **Verification:** Strict identity verification against Bar Council records.
*   **Case Marketplace:** Browse available cases and submit proposals.
*   **Dashboard:** Track earnings, active cases, and performance analytics.
*   **AI Law Assistant:** Tools for case summarization and research.
*   **Reputation Management:** Client reviews and verified badges.

### Core Platform
*   **Real-time Chat:** Secure messaging between clients and lawyers.
*   **Notifications:** Instant updates on bids, messages, and case status.
*   **Wallet:** Track payments and transaction history.
*   **Multi-Role Auth:** Secure role-based access for Clients and Lawyers.

## 🛠 Tech Stack

*   **Framework:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 50+)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Navigation:** React Navigation (Tabs, Stacks, Modals)
*   **Backend:** Firebase (Auth, Firestore, Storage)
*   **UI/UX:** Custom components, Expo Vector Icons, Linear Gradients.
*   **AI Integration:** Support for OpenAI, Gemini, and Claude APIs.

## 🚀 Getting Started

### Prerequisites
*   Node.js (LTS version)
*   npm or yarn
*   Expo Go app on your mobile device (or Android/iOS Simulator)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Abdullahbinaqeel/Insaf-FYP.git
    cd insaf
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory (refer to `.env.example` if available) and add your API keys:
    ```env
    # Firebase Configuration
    EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    # ... other firebase config

    # AI Configuration (Optional)
    EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key
    EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key
    ```

4.  **Run the Project**
    ```bash
    npx expo start
    ```
    *   Press `a` for Android Emulator
    *   Press `i` for iOS Simulator
    *   Scan QR code with Expo Go for physical device

## 📂 Project Structure

```
src/
├── components/   # Reusable UI components (Buttons, Cards, Inputs)
├── config/       # App configuration (Firebase, AI)
├── context/      # Global state (Auth, Theme)
├── navigation/   # Stack and Tab navigators
├── screens/      # Application screens (Auth, Lawyer, Main, Detail)
├── services/     # API and Business logic (Firestore, Auth services)
├── theme/        # Design system (Colors, Typography)
└── utils/        # Helper functions and validators
```

## 🔐 Verification (Test Data)
For testing the Lawyer Verification flow, use the following mock credential:
*   **License:** `ABD12345`
*   **CNIC:** `35201-1122334-4`
*   **Name:** Must match your profile name (e.g., "Abdullah Bin Aqeel")

## 📄 License
This project is licensed under the MIT License.

---
Built with ❤️ for Justice.
