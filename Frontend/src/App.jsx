import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Dashboard from "./pages/Dashboard";
import Meters from "./pages/Meters";
import Communications from "./pages/Communications";
import PageNotFound from "./pages/PageNotFound";
import GlobalStyles from "./styles/GlobalStyles";
import AppLayout from "./ui/AppLayout";
import SignUp from "./pages/SignUp";
import Demanda from "./pages/Demanda";
import Settings from "./pages/Settings";
import Locations from "./pages/Locations";
import Actas from "./pages/Actas";
import { Toaster } from "react-hot-toast";
import Reports from "./pages/Reports";
import Authentication from "./features/authentication/Authentication";
import { RequireAuth } from "./features/authentication/RequireAuth";
import { UserProvider } from "./features/authentication/UserProvider";
import { DarkModeProvider } from "./context/DarkModeContext";
import ActasPuntoMedicion from "./features/actas/ActasPuntoMedicion";
import Admin from "./pages/Admin";
import PlanVerificaciones from "./pages/PlanVerificaciones";
import TablaEstadoComm from "./pages/TablaEstadoComm";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

function App() {
  return (
    <DarkModeProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <GlobalStyles />
        <BrowserRouter>
          <Routes>
            <Route
              element={
                <UserProvider>
                  <RequireAuth>
                    <AppLayout />
                  </RequireAuth>
                </UserProvider>
              }
            >
              <Route index element={<Navigate replace to="dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="meters" element={<Meters />} />
              <Route path="communications">
                <Route index element={<Communications />} />
                <Route path="status" element={<Communications />} />
                <Route path="tiempo" element={<TablaEstadoComm />} />
              </Route>
              <Route path="demanda" element={<Demanda />} />
              <Route path="admin">
                <Route index element={<Admin />} />
                <Route path="validaciones" element={<Admin />} />
                <Route
                  path="plan_verificaciones"
                  element={<PlanVerificaciones />}
                />
              </Route>
              <Route path="reports" element={<Reports />} />
              <Route path="locations" element={<Locations />} />
              <Route path="actas" element={<Actas />} />
              <Route path="actas/:id" element={<ActasPuntoMedicion />} />
            </Route>

            <Route path="login" element={<Authentication />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ marin: "8px" }}
          toastOptions={{
            success: {
              duration: 3000,
            },
            error: {
              duration: 5000,
            },
            style: {
              fontSize: "16px",
              maxWidth: "500px",
              padding: "16px 24px",
              backgroundColor: "var(--color-grey-0)",
              border: "1px solid var(--color-institucional-celeste)",
              color: "var(--color-grey-700)",
            },
          }}
        />
      </QueryClientProvider>
    </DarkModeProvider>
  );
}

export default App;
