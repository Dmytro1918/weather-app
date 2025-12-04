☁️ Weather Dashboard SPA (Next.js Technical Assignment)
This is a Single Page Application (SPA) built using Next.js 14 and React to display real-time weather data for user-selected cities. The application emphasizes client-side state management, efficient API querying, and modern adaptive design without relying on complex external state managers.

✨ Features
City Management: Users can add and remove cities, with the list persisting across sessions via Local Storage.

Real-Time Refresh: Automatic refresh of all city data upon page load and manual refresh options for individual cards or the entire dashboard.

Optimized API Calls: Detail pages use Query Parameter propagation to fetch coordinates, reducing redundant API calls.

Local Storage Persistence: All added city data and configurations are stored locally.

Detailed View (Bonus): Clicking a card navigates to a detail view featuring current conditions and a recharts graph for hourly temperature and meteorological data.

Adaptive Design: Fully mobile-responsive interface (Mobile First approach) with SCSS and CSS Grid.

Stack: 
Category,Technology,Purpose
Frontend,Next.js 14 (App Router),"React framework for routing, server-side rendering (SSR), and performance."
Styling,SCSS Modules,"CSS preprocessor for modular and maintainable styles, using a Mobile First approach."
State Management,useState / useCallback,Client-side state and logic management.
Data Fetching,Native fetch,Used within custom service wrappers for clean API communication.
Data Visualization,Recharts,Rendering responsive line charts for hourly forecast data.
UI Library,Material UI (MUI),Used minimally for buttons and base components.

▶️ Running the Application
To start the project in development mode:

1. Start Development Server
We use the stable Webpack compiler to avoid WASM/Turbopack conflicts found in some Node.js environments:
npm run dev -- --no-turbo 
# OR check your package.json for the correct 'dev' script
The application will be accessible at http://localhost:3000.

2. Production Build (Optional)
To test the optimized production performance (which relies on SSR):
# npm run build
# npm run start

🧪 Testing
The project uses Jest and React Testing Library (RTL) for testing core component functionality (e.g., adding/removing cities, initial refresh).
# npm test