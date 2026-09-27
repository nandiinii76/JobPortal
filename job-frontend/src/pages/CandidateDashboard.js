import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./CandidateDashboard.css";

const CandidateDashboard = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [applications, setApplications] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [resume, setResume] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            // =================================================
            // AUTHENTICATION DATA
            // =================================================

            const token = localStorage.getItem("token");
            const storedUserId = localStorage.getItem("userId");
            const storedRole = localStorage.getItem("role");

            console.log("CandidateDashboard");
            console.log("Token exists:", !!token);
            console.log("User ID:", storedUserId);
            console.log("Role:", storedRole);

            // =================================================
            // CHECK LOGIN
            // =================================================

            if (!token) {
                navigate("/login", {
                    replace: true
                });

                return;
            }

            if (!storedUserId) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");

                navigate("/login", {
                    replace: true
                });

                return;
            }

            // =================================================
            // CHECK ROLE
            // =================================================

            let normalizedRole = storedRole
                ? storedRole.trim().toUpperCase()
                : "";

            if (
                normalizedRole === "USER" ||
                normalizedRole === "ROLE_USER" ||
                normalizedRole === "CANDIDATE" ||
                normalizedRole === "ROLE_CANDIDATE" ||
                normalizedRole === "JOB_SEEKER" ||
                normalizedRole === "JOBSEEKER"
            ) {
                normalizedRole = "ROLE_JOB_SEEKER";
            }

            if (normalizedRole !== "ROLE_JOB_SEEKER") {

                if (
                    normalizedRole === "ROLE_EMPLOYER"
                ) {
                    navigate("/employer-dashboard", {
                        replace: true
                    });

                    return;
                }

                if (
                    normalizedRole === "ROLE_RECRUITER"
                ) {
                    navigate("/recruiter-dashboard", {
                        replace: true
                    });

                    return;
                }

                if (
                    normalizedRole === "ROLE_ADMIN"
                ) {
                    navigate("/admin-dashboard", {
                        replace: true
                    });

                    return;
                }

                navigate("/login", {
                    replace: true
                });

                return;
            }

            // =================================================
            // USER
            // =================================================

            const userId = storedUserId;

            setUser({
                id: userId,
                name: "Candidate"
            });

            // =================================================
            // APPLICATIONS
            // =================================================

            try {
                const response = await API.get(
                    `/applications/user/${userId}`
                );

                setApplications(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );

            } catch (err) {
                console.error(
                    "Failed to load applications:",
                    err
                );

                setApplications([]);
            }

            // =================================================
            // INTERVIEWS
            // =================================================

            try {
                const response = await API.get(
                    `/interviews/candidate/${userId}`
                );

                setInterviews(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );

            } catch (err) {
                console.error(
                    "Failed to load interviews:",
                    err
                );

                setInterviews([]);
            }

            // =================================================
            // NOTIFICATIONS
            // =================================================

            try {
                const response = await API.get(
                    `/notifications/user/${userId}`
                );

                setNotifications(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );

            } catch (err) {
                console.error(
                    "Failed to load notifications:",
                    err
                );

                setNotifications([]);
            }

            // =================================================
            // RESUME
            // =================================================

            try {
                const response = await API.get(
                    `/resumes/user/${userId}`
                );

                setResume(response.data);

            } catch (err) {
                console.error(
                    "Failed to load resume:",
                    err
                );

                setResume(null);
            }

        } catch (err) {

            console.error(
                "Dashboard loading error:",
                err
            );

            setError(
                "Unable to load dashboard."
            );

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        navigate("/login", {
            replace: true
        });
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }

        try {
            return new Date(date).toLocaleDateString();
        } catch {
            return date;
        }
    };

    // =====================================================
    // APPLICATION STATUS
    // =====================================================

    const getStatusClass = (status) => {

        if (!status) {
            return "status-default";
        }

        switch (String(status).toUpperCase()) {

            case "APPLIED":
                return "status-applied";

            case "SHORTLISTED":
                return "status-shortlisted";

            case "INTERVIEW":
                return "status-interview";

            case "SELECTED":
                return "status-selected";

            case "REJECTED":
                return "status-rejected";

            default:
                return "status-default";
        }
    };

    // =====================================================
    // UNREAD NOTIFICATIONS
    // =====================================================

    const unreadNotifications =
        notifications.filter(
            (notification) =>
                !notification.isRead
        );

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="dashboard-loading">
                <h2>Loading Dashboard...</h2>
            </div>
        );
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (error) {
        return (
            <div className="dashboard-error">

                <h2>{error}</h2>

                <button onClick={loadDashboard}>
                    Try Again
                </button>

            </div>
        );
    }

    // =====================================================
    // DASHBOARD
    // =====================================================

    return (
        <div className="candidate-dashboard">

            {/* =================================================
                GLOBAL NAVBAR
                =================================================

                Navbar is already provided by App.js.

                We intentionally DO NOT create another navbar
                here.

                Expected top structure:

                Job Portal
                Dashboard
                Jobs
                Saved Jobs
                My Applications
                My Interviews
                Profile
                Home
                Notifications
                Logout

            ================================================= */}

            <main className="dashboard-content">

                {/* =================================================
                    WELCOME
                ================================================= */}

                <section className="welcome-section">

                    <h1>
                        Welcome back,{" "}
                        {user?.name || "Candidate"}!
                    </h1>

                    <p>
                        Manage your job applications,
                        interviews, resume and
                        notifications from here.
                    </p>

                </section>


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <section className="dashboard-stats">

                    <div className="stat-card">

                        <h3>
                            Applications
                        </h3>

                        <p>
                            {applications.length}
                        </p>

                    </div>


                    <div className="stat-card">

                        <h3>
                            Interviews
                        </h3>

                        <p>
                            {interviews.length}
                        </p>

                    </div>


                    <div className="stat-card">

                        <h3>
                            Notifications
                        </h3>

                        <p>
                            {notifications.length}
                        </p>

                    </div>


                    <div className="stat-card">

                        <h3>
                            Unread
                        </h3>

                        <p>
                            {unreadNotifications.length}
                        </p>

                    </div>

                </section>


                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <section className="quick-actions">

                    <h2>
                        Quick Actions
                    </h2>

                    <div className="action-buttons">

                        <button
                            onClick={() =>
                                navigate("/jobs")
                            }
                        >
                            Browse Jobs
                        </button>


                        <button
                            onClick={() =>
                                navigate(
                                    "/my-applications"
                                )
                            }
                        >
                            My Applications
                        </button>


                        <button
                            onClick={() =>
                                navigate(
                                    "/my-interviews"
                                )
                            }
                        >
                            My Interviews
                        </button>


                        <button
                            onClick={() =>
                                navigate(
                                    "/notifications"
                                )
                            }
                        >
                            Notifications

                            {unreadNotifications.length > 0 && (
                                <span>
                                    {" "}
                                    ({unreadNotifications.length})
                                </span>
                            )}

                        </button>


                        <button
                            onClick={() =>
                                navigate("/resume")
                            }
                        >
                            Resume
                        </button>


                        <button
                            onClick={() =>
                                navigate("/profile")
                            }
                        >
                            Profile
                        </button>

                    </div>

                </section>


                {/* =================================================
                    RECENT APPLICATIONS
                ================================================= */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <h2>
                            Recent Applications
                        </h2>

                        <button
                            onClick={() =>
                                navigate(
                                    "/my-applications"
                                )
                            }
                        >
                            View All
                        </button>

                    </div>


                    {applications.length === 0 ? (

                        <div className="empty-state">

                            <p>
                                You have not applied
                                for any jobs yet.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/jobs")
                                }
                            >
                                Browse Jobs
                            </button>

                        </div>

                    ) : (

                        <div className="application-list">

                            {applications
                                .slice(0, 5)
                                .map((application) => (

                                    <div
                                        className="application-card"
                                        key={application.id}
                                    >

                                        <div>

                                            <h3>
                                                {application.job?.title ||
                                                    "Job Position"}
                                            </h3>

                                            <p>
                                                {application.job?.employer?.companyName ||
                                                    application.job?.companyName ||
                                                    "Company"}
                                            </p>

                                            <p>
                                                Applied:{" "}
                                                {formatDate(
                                                    application.appliedDate ||
                                                    application.createdAt
                                                )}
                                            </p>

                                        </div>


                                        <span
                                            className={getStatusClass(
                                                application.status
                                            )}
                                        >
                                            {application.status ||
                                                "APPLIED"}
                                        </span>

                                    </div>

                                ))}

                        </div>

                    )}

                </section>


                {/* =================================================
                    UPCOMING INTERVIEWS
                ================================================= */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <h2>
                            Upcoming Interviews
                        </h2>

                        <button
                            onClick={() =>
                                navigate(
                                    "/my-interviews"
                                )
                            }
                        >
                            View All
                        </button>

                    </div>


                    {interviews.length === 0 ? (

                        <div className="empty-state">

                            <p>
                                No interviews scheduled.
                            </p>

                        </div>

                    ) : (

                        <div className="interview-list">

                            {interviews
                                .slice(0, 5)
                                .map((interview) => (

                                    <div
                                        className="interview-card"
                                        key={interview.id}
                                    >

                                        <h3>
                                            {interview.application?.job?.title ||
                                                "Job Interview"}
                                        </h3>

                                        <p>
                                            Date:{" "}
                                            {formatDate(
                                                interview.interviewDate
                                            )}
                                        </p>

                                        <p>
                                            Time:{" "}
                                            {interview.interviewTime ||
                                                "N/A"}
                                        </p>

                                        <p>
                                            Mode:{" "}
                                            {interview.interviewMode ||
                                                "N/A"}
                                        </p>


                                        {interview.meetingLink && (

                                            <a
                                                href={
                                                    interview.meetingLink
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Join Meeting
                                            </a>

                                        )}


                                        {interview.location && (

                                            <p>
                                                Location:{" "}
                                                {interview.location}
                                            </p>

                                        )}


                                        <span>
                                            {interview.status ||
                                                "SCHEDULED"}
                                        </span>

                                    </div>

                                ))}

                        </div>

                    )}

                </section>


                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <h2>
                            Recent Notifications
                        </h2>

                        <button
                            onClick={() =>
                                navigate(
                                    "/notifications"
                                )
                            }
                        >
                            View All
                        </button>

                    </div>


                    {notifications.length === 0 ? (

                        <div className="empty-state">

                            <p>
                                No notifications.
                            </p>

                        </div>

                    ) : (

                        <div className="notification-list">

                            {notifications
                                .slice(0, 5)
                                .map((notification) => (

                                    <div
                                        className={`notification-card ${
                                            notification.isRead
                                                ? ""
                                                : "unread"
                                        }`}
                                        key={notification.id}
                                    >

                                        <div>

                                            <h3>
                                                {notification.title ||
                                                    notification.type ||
                                                    "Notification"}
                                            </h3>

                                            <p>
                                                {notification.message ||
                                                    "No message"}
                                            </p>

                                            <small>
                                                {formatDate(
                                                    notification.createdAt
                                                )}
                                            </small>

                                        </div>


                                        {!notification.isRead && (

                                            <span>
                                                NEW
                                            </span>

                                        )}

                                    </div>

                                ))}

                        </div>

                    )}

                </section>


                {/* =================================================
                    RESUME
                ================================================= */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <h2>
                            Resume
                        </h2>

                        <button
                            onClick={() =>
                                navigate("/resume")
                            }
                        >
                            Manage Resume
                        </button>

                    </div>


                    {resume ? (

                        <div className="resume-card">

                            <h3>
                                Resume Available
                            </h3>

                            <p>
                                Your resume is uploaded
                                and available.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/resume")
                                }
                            >
                                View Resume
                            </button>

                        </div>

                    ) : (

                        <div className="empty-state">

                            <p>
                                You have not uploaded
                                a resume yet.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/resume")
                                }
                            >
                                Upload Resume
                            </button>

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
};

export default CandidateDashboard;