import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import {
  MantineProvider,
  createTheme,
  ColorSchemeScript,
} from "@mantine/core";
import "@mantine/core/styles.css";
import AuthLayout from "./components/Layout/AuthLayout";
import Dashboard from "./components/Home/Dashboard";
import EmployeeRoutes from "./components/routes/EmployeeRoutes";
import CompanyRoutes from "./components/routes/CompanyRoutes";
import AttendanceRoutes from "./components/routes/AttendanceRoutes";
import { AuthForm } from "./components/Register/register";
import { ProfilePage } from "./components/Profile/ProfilePage";
import SalaryPage from "./components/Salary/Salary";
import PayrollManagementSystem from "./components/Salary/PayrollManagementSystem";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "react-query";
import ProtectedRoute from "./components/ProtectedRoute";
import { MainLayout } from "./components/Layout/MainLayout";

const theme = createTheme({});

const queryClient = new QueryClient();

const App = () => {
  return (
    <>
      <ColorSchemeScript />
      <MantineProvider theme={theme} defaultColorScheme="light">
        <QueryClientProvider client={queryClient}>
          <Notifications />
          <Router>
            <Routes>
              
              {/* Public Route */}
              <Route element={<AuthLayout />}>
                <Route path="/auth" element={<AuthForm />} />
              </Route>

              {/* Protected Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/employees/*" element={<EmployeeRoutes />} />
                <Route path="/companies/*" element={<CompanyRoutes />} />
                <Route path="/attendance/*" element={<AttendanceRoutes />} />
                <Route path="/salary/*" element={<SalaryPage />} />
                <Route
                  path="/payroll/*"
                  element={<PayrollManagementSystem />}
                />
              </Route>

              {/* Redirect all unknown routes */}
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          </Router>
        </QueryClientProvider>
      </MantineProvider>
    </>
  );
};

export default App;
