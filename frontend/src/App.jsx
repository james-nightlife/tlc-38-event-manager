import "./App.css";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import SignIn from "./pages/SignIn";
import RootLayout from "./layout/RootLayout";
import Dashboard from "./pages/Dashboard";
import DashboardWorkshop from "./pages/DashboardWorkshop";
import TestScan from "./pages/TestScan";

// -----
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ------
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route index element={<TestScan />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/workshop" element={<DashboardWorkshop />} />
      </Route>,
    ),
    {
      basename: import.meta.env.VITE_BASE_URL || "",
    },
  );

  return (
    // ------------
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
