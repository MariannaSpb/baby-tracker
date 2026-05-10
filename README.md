# 🌙 Baby Tracker

A warm, mobile-first web application designed specifically for sleep-deprived parents to easily track their newborn's daily rhythms—sleep, feeds, and diapers. 

Built to be used effortlessly with one hand during those 3 AM wake-ups, Baby Tracker combines a soothing, accessible interface with powerful charting so you can spot emerging routines and patterns without the mental math.

## 🛠️ Tech Stack

This project is split into a robust backend and a lightning-fast frontend:

- **Frontend**: Angular 21+ (Standalone components, Signals for state), TypeScript, SCSS.
- **Backend**: Node.js REST API deployed to Google Cloud Run.
- **Database**: Firebase Firestore.
- **Authentication**: Firebase Google Sign-In for secure, cross-device synchronization.

## 🚀 Getting Started

If you want to run this project locally on your machine, follow these steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine. 

### Running the Frontend

1. Open your terminal and navigate to the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run start
   ```
4. Open your browser and visit `http://localhost:4200/`.

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend development server:
   ```bash
   npm run start
   ```

*(Note: You will need your own Firebase service account keys to run the database locally).*

## 🎨 Accessibility (A11y) Commitment

Accessibility isn't an afterthought here; it's a strict requirement. We enforce semantic HTML, logical heading hierarchies, ARIA live regions for dynamic content, and high-contrast visuals to ensure the app is a safe, inclusive space for everyone.

---
*Built with ❤️ and coffee. Lots of coffee.*
