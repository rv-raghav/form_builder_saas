import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import PermissionRoute from "./routes/PermissionRoute";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import AppLayout from "./layout/AppLayout";

const Landing = lazy(() => import("./pages/Marketing/Landing"));
const Pricing = lazy(() => import("./pages/Marketing/Pricing"));
const SignIn = lazy(() => import("./pages/Auth/SignIn"));
const SignUp = lazy(() => import("./pages/Auth/SignUp"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));
const SetPassword = lazy(() => import("./pages/Auth/SetPassword"));
const NotFound = lazy(() => import("./pages/Error/NotFound"));

const DashboardHome = lazy(() => import("./pages/Dashboard/DashboardHome"));
const UserProfile = lazy(() => import("./pages/UserProfile/UserProfile"));
const UserManagement = lazy(
  () => import("./pages/Administration/UserManagement/UserManagement"),
);
const AccessControl = lazy(
  () => import("./pages/Administration/AccessControl/AccessControl"),
);
const FormsList = lazy(() => import("./pages/Forms/FormsList"));
const FormBuilder = lazy(() => import("./pages/Forms/FormBuilder"));
const Submissions = lazy(() => import("./pages/Submissions/Submissions"));
const Explore = lazy(() => import("./pages/Explore/Explore"));
const FormFill = lazy(() => import("./pages/Public/FormFill"));
const FormThankYou = lazy(() => import("./pages/Public/FormThankYou"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
      </div>
    </div>
  );
}

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LazyPage><Landing /></LazyPage>} />
          <Route path="/pricing" element={<LazyPage><Pricing /></LazyPage>} />

          <Route path="/explore" element={<LazyPage><Explore /></LazyPage>} />
          <Route path="/f/:slug" element={<LazyPage><FormFill /></LazyPage>} />
          <Route
            path="/f/:slug/thank-you"
            element={<LazyPage><FormThankYou /></LazyPage>}
          />

          <Route element={<PublicRoute />}>
            <Route path="/signin" element={<LazyPage><SignIn /></LazyPage>} />
            <Route path="/signup" element={<LazyPage><SignUp /></LazyPage>} />
            <Route path="/forgot-password" element={<LazyPage><ForgotPassword /></LazyPage>} />
            <Route path="/reset-password" element={<LazyPage><ResetPassword /></LazyPage>} />
          </Route>

          <Route path="/set-password" element={<LazyPage><SetPassword /></LazyPage>} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route element={<PermissionRoute pageSlug="dashboard" />}>
                <Route
                  path="/dashboard"
                  element={
                    <LazyPage>
                      <DashboardHome />
                    </LazyPage>
                  }
                />
              </Route>

              <Route element={<PermissionRoute pageSlug="forms" />}>
                <Route
                  path="/forms"
                  element={
                    <LazyPage>
                      <FormsList />
                    </LazyPage>
                  }
                />
                <Route
                  path="/forms/:id/edit"
                  element={
                    <LazyPage>
                      <FormBuilder />
                    </LazyPage>
                  }
                />
              </Route>

              <Route element={<PermissionRoute pageSlug="submissions" />}>
                <Route
                  path="/submissions"
                  element={
                    <LazyPage>
                      <Submissions />
                    </LazyPage>
                  }
                />
              </Route>

              <Route element={<PermissionRoute pageSlug="user-management" />}>
                <Route
                  path="/user-management"
                  element={
                    <LazyPage>
                      <UserManagement />
                    </LazyPage>
                  }
                />
              </Route>

              <Route element={<PermissionRoute pageSlug="access-control" />}>
                <Route
                  path="/access-control"
                  element={
                    <LazyPage>
                      <AccessControl />
                    </LazyPage>
                  }
                />
              </Route>

              <Route
                path="/profile"
                element={
                  <LazyPage>
                    <UserProfile />
                  </LazyPage>
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<LazyPage><NotFound /></LazyPage>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
