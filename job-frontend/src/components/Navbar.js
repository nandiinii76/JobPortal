import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import API from "../services/api";

function Navbar() {

    const navigate = useNavigate();

    // ==========================================
    // AUTH STATE
    // ==========================================

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const [role, setRole] = useState(
        localStorage.getItem("role")
    );

    const [userId, setUserId] = useState(
        localStorage.getItem("userId")
    );

    const [unreadCount, setUnreadCount] = useState(0);

    // ==========================================
    // REFRESH AUTH STATE
    // ==========================================

    const refreshAuthState = useCallback(() => {

        setToken(
            localStorage.getItem("token")
        );

        setRole(
            localStorage.getItem("role")
        );

        setUserId(
            localStorage.getItem("userId")
        );

    }, []);

    // ==========================================
    // LOAD UNREAD COUNT
    // ==========================================

    const loadUnreadCount = useCallback(async () => {

        const currentUserId =
            localStorage.getItem("userId");

        const currentToken =
            localStorage.getItem("token");

        if (!currentUserId || !currentToken) {

            setUnreadCount(0);

            return;
        }

        try {

            const response = await API.get(
                `/notifications/user/${currentUserId}/count`
            );

            setUnreadCount(
                Number(response.data) || 0
            );

        } catch (error) {

            console.error(
                "Failed to load notification count:",
                error
            );

            setUnreadCount(0);
        }

    }, []);

    // ==========================================
    // AUTH STATE LISTENER
    // ==========================================

    useEffect(() => {

        refreshAuthState();

        const handleAuthChange = () => {

            refreshAuthState();

        };

        window.addEventListener(
            "storage",
            handleAuthChange
        );

        window.addEventListener(
            "authChanged",
            handleAuthChange
        );

        return () => {

            window.removeEventListener(
                "storage",
                handleAuthChange
            );

            window.removeEventListener(
                "authChanged",
                handleAuthChange
            );

        };

    }, [refreshAuthState]);

    // ==========================================
    // NOTIFICATION CHANGE LISTENER
    // ==========================================

    useEffect(() => {

        if (!token || !userId) {

            setUnreadCount(0);

            return;
        }

        loadUnreadCount();

        const handleNotificationChange = () => {

            loadUnreadCount();

        };

        window.addEventListener(
            "notificationsChanged",
            handleNotificationChange
        );

        const interval = setInterval(() => {

            loadUnreadCount();

        }, 10000);

        return () => {

            window.removeEventListener(
                "notificationsChanged",
                handleNotificationChange
            );

            clearInterval(interval);

        };

    }, [
        token,
        userId,
        loadUnreadCount
    ]);

    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");

        setToken(null);
        setRole(null);
        setUserId(null);
        setUnreadCount(0);

        window.dispatchEvent(
            new Event("authChanged")
        );

        window.dispatchEvent(
            new Event("notificationsChanged")
        );

        navigate("/login");

    };

    // ==========================================
    // COMMON LINK STYLE
    // ==========================================

    const linkClass = `
        hover:text-blue-400
        transition
    `;

    // ==========================================
    // NAVBAR
    // ==========================================

    return (

        <nav className="
            bg-gray-900
            text-white
            shadow-lg
        ">

            <div className="
                max-w-7xl
                mx-auto
                px-6
                py-4
                flex
                justify-between
                items-center
            ">

                {/* ==================================
                    LOGO
                ================================== */}

                <Link
                    to={token ? "/jobs" : "/login"}
                    className="
                        text-2xl
                        font-bold
                        text-blue-400
                        hover:text-blue-300
                        transition
                    "
                >
                    Job Portal
                </Link>

                {/* ==================================
                    NAVIGATION
                ================================== */}

                <div className="
                    flex
                    gap-6
                    items-center
                ">

                    {/* ==================================
                        NOT LOGGED IN
                    ================================== */}

                    {!token ? (

                        <>

                            <Link
                                to="/login"
                                className={linkClass}
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className={linkClass}
                            >
                                Register
                            </Link>

                        </>

                    ) : (

                        <>

                            {/* ==================================
                                JOB SEEKER
                            ================================== */}

                            {role === "ROLE_JOB_SEEKER" && (

                                <>

                                    <Link
                                        to="/candidate-dashboard"
                                        className={linkClass}
                                    >
                                        Dashboard
                                    </Link>

                                    <Link
                                        to="/jobs"
                                        className={linkClass}
                                    >
                                        Jobs
                                    </Link>

                                    <Link
                                        to="/saved-jobs"
                                        className={linkClass}
                                    >
                                        Saved Jobs
                                    </Link>

                                    <Link
                                        to="/my-applications"
                                        className={linkClass}
                                    >
                                        My Applications
                                    </Link>

                                    <Link
                                        to="/my-interviews"
                                        className={linkClass}
                                    >
                                        My Interviews
                                    </Link>

                                    {/* ==============================
                                        RESUME
                                    ============================== */}

                                    <Link
                                        to="/resume"
                                        className={linkClass}
                                    >
                                        Resume
                                    </Link>

                                    <Link
                                        to="/profile"
                                        className={linkClass}
                                    >
                                        Profile
                                    </Link>

                                </>

                            )}

                            {/* ==================================
                                EMPLOYER
                            ================================== */}

                            {role === "ROLE_EMPLOYER" && (

                                <>

                                    <Link
                                        to="/employer-dashboard"
                                        className={linkClass}
                                    >
                                        Dashboard
                                    </Link>

                                    <Link
                                        to="/jobs"
                                        className={linkClass}
                                    >
                                        My Jobs
                                    </Link>

                                    <Link
                                        to="/add-job"
                                        className={linkClass}
                                    >
                                        Add Job
                                    </Link>

                                    <Link
                                        to="/manage-applications"
                                        className={linkClass}
                                    >
                                        Applications
                                    </Link>

                                    <Link
                                        to="/manage-interviews"
                                        className={linkClass}
                                    >
                                        Interviews
                                    </Link>

                                    <Link
                                        to="/analytics"
                                        className={linkClass}
                                    >
                                        Analytics
                                    </Link>

                                    <Link
                                        to="/employer-profile"
                                        className={linkClass}
                                    >
                                        Company Profile
                                    </Link>

                                </>

                            )}

                            {/* ==================================
                                RECRUITER
                            ================================== */}

                            {role === "ROLE_RECRUITER" && (

                                <>

                                    <Link
                                        to="/recruiter-dashboard"
                                        className={linkClass}
                                    >
                                        Dashboard
                                    </Link>

                                    <Link
                                        to="/jobs"
                                        className={linkClass}
                                    >
                                        Jobs
                                    </Link>

                                    <Link
                                        to="/profile"
                                        className={linkClass}
                                    >
                                        Profile
                                    </Link>

                                </>

                            )}

                            {/* ==================================
                                COMMON HOME
                            ================================== */}

                            <Link
                                to="/dashboard"
                                className={linkClass}
                            >
                                Home
                            </Link>

                            {/* ==================================
                                NOTIFICATIONS
                            ================================== */}

                            <Link
                                to="/notifications"
                                className="
                                    relative
                                    text-xl
                                    hover:text-yellow-400
                                    transition
                                    flex
                                    items-center
                                    justify-center
                                    w-8
                                    h-8
                                "
                                title={
                                    unreadCount > 0
                                        ? `${unreadCount} unread notifications`
                                        : "Notifications"
                                }
                            >

                                <span>
                                    🔔
                                </span>

                                {unreadCount > 0 && (

                                    <span
                                        className="
                                            absolute
                                            -top-2
                                            -right-3
                                            bg-red-600
                                            text-white
                                            text-[10px]
                                            font-bold
                                            rounded-full
                                            min-w-[20px]
                                            h-5
                                            px-1
                                            flex
                                            items-center
                                            justify-center
                                            border
                                            border-gray-900
                                        "
                                    >
                                        {unreadCount > 99
                                            ? "99+"
                                            : unreadCount}
                                    </span>

                                )}

                            </Link>

                            {/* ==================================
                                LOGOUT
                            ================================== */}

                            <button
                                onClick={handleLogout}
                                className="
                                    bg-red-500
                                    hover:bg-red-600
                                    px-4
                                    py-2
                                    rounded-lg
                                    transition
                                    font-medium
                                "
                            >
                                Logout
                            </button>

                        </>

                    )}

                </div>

            </div>

        </nav>
    );
}

export default Navbar;