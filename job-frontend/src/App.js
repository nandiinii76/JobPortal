import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import CompanyProfile from "./pages/CompanyProfile";

import Dashboard from "./pages/Dashboard";
import CandidateDashboard from "./pages/CandidateDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import AddJob from "./pages/AddJob";
import EditJob from "./pages/EditJob";
import SavedJobs from "./pages/SavedJobs";

import Profile from "./pages/Profile";
import Resume from "./pages/Resume";
import EmployerProfile from "./pages/EmployerProfile";

import MyApplications from "./pages/MyApplications";
import ManageApplications from "./pages/ManageApplications";
import ApplicationDetails from "./pages/ApplicationDetails";

import MyInterviews from "./pages/MyInterviews";
import ManageInterviews from "./pages/ManageInterviews";
import ScheduleInterview from "./pages/ScheduleInterview";
import EditInterview from "./pages/EditInterview";

import Notifications from "./pages/Notifications";

function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>

                {/* ==================== PUBLIC ROUTES ==================== */}

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* ==================== GENERAL DASHBOARD ==================== */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* ==================== CANDIDATE ROUTES ==================== */}

                <Route
                    path="/candidate-dashboard"
                    element={
                        <ProtectedRoute role="ROLE_JOB_SEEKER">
                            <CandidateDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/jobs"
                    element={<Jobs />}
                />

                <Route
                    path="/jobs/:id"
                    element={<JobDetails />}
                />

                <Route
                    path="/company/:id"
                    element={<CompanyProfile />}
                />

                <Route
                    path="/saved-jobs"
                    element={
                        <ProtectedRoute role="ROLE_JOB_SEEKER">
                            <SavedJobs />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/my-applications"
                    element={
                        <ProtectedRoute role="ROLE_JOB_SEEKER">
                            <MyApplications />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/my-interviews"
                    element={
                        <ProtectedRoute role="ROLE_JOB_SEEKER">
                            <MyInterviews />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute role="ROLE_JOB_SEEKER">
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/resume"
                    element={
                        <ProtectedRoute role="ROLE_JOB_SEEKER">
                            <Resume />
                        </ProtectedRoute>
                    }
                />

                {/* ==================== EMPLOYER ROUTES ==================== */}

                <Route
                    path="/employer-dashboard"
                    element={
                        <ProtectedRoute role="ROLE_EMPLOYER">
                            <EmployerDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/add-job"
                    element={
                        <ProtectedRoute role="ROLE_EMPLOYER">
                            <AddJob />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/edit-job/:id"
                    element={
                        <ProtectedRoute role="ROLE_EMPLOYER">
                            <EditJob />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employer-profile"
                    element={
                        <ProtectedRoute role="ROLE_EMPLOYER">
                            <EmployerProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/manage-applications"
                    element={
                        <ProtectedRoute role="ROLE_EMPLOYER">
                            <ManageApplications />
                        </ProtectedRoute>
                    }
                />

                {/* ==================== APPLICATION DETAILS ==================== */}

                <Route
                    path="/applications/:id"
                    element={
                        <ProtectedRoute>
                            <ApplicationDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/schedule-interview/:applicationId"
                    element={
                        <ProtectedRoute role="ROLE_EMPLOYER">
                            <ScheduleInterview />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/manage-interviews"
                    element={
                        <ProtectedRoute role="ROLE_EMPLOYER">
                            <ManageInterviews />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/edit-interview/:id"
                    element={
                        <ProtectedRoute role="ROLE_EMPLOYER">
                            <EditInterview />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/analytics"
                    element={
                        <ProtectedRoute role="ROLE_EMPLOYER">
                            <AnalyticsDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* ==================== RECRUITER ROUTES ==================== */}

                <Route
                    path="/recruiter-dashboard"
                    element={
                        <ProtectedRoute role="ROLE_RECRUITER">
                            <RecruiterDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* ==================== NOTIFICATIONS ==================== */}

                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>
                            <Notifications />
                        </ProtectedRoute>
                    }
                />

                {/* ==================== FALLBACK ==================== */}

                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;