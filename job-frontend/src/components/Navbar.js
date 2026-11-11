
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
    // NORMALIZE ROLE
    // ==========================================

    const normalizeRole = useCallback((value) => {

        if (!value) {
            return "";
        }

        let normalized = String(value)
            .trim()
            .toUpperCase();

        while (normalized.startsWith("ROLE_ROLE_")) {
            normalized = normalized.substring(5);
        }

        switch (normalized) {

            case "USER":
            case "ROLE_USER":

            case "CANDIDATE":
            case "ROLE_CANDIDATE":

            case "JOBSEEKER":
            case "JOB_SEEKER":
            case "ROLE_JOBSEEKER":
            case "ROLE_JOB_SEEKER":

                return "ROLE_JOB_SEEKER";

            case "EMPLOYER":
            case "ROLE_EMPLOYER":

                return "ROLE_EMPLOYER";

            case "RECRUITER":
            case "ROLE_RECRUITER":

                return "ROLE_RECRUITER";

            case "ADMIN":
            case "ROLE_ADMIN":

                return "ROLE_ADMIN";

            default:

                if (normalized.startsWith("ROLE_")) {
                    return normalized;
                }

                return `ROLE_${normalized}`;
        }

    }, []);

    // ==========================================
    // REFRESH AUTH STATE
    // ==========================================

    const refreshAuthState = useCallback(() => {

        const currentToken =
            localStorage.getItem("token");

        const currentRole =
            localStorage.getItem("role");

        const currentUserId =
            localStorage.getItem("userId");

        setToken(currentToken);

        setRole(
            normalizeRole(currentRole)
        );

        setUserId(currentUserId);

    }, [normalizeRole]);

    // ==========================================
    // LOAD UNREAD COUNT
    // ==========================================

    const loadUnreadCount = useCallback(async () => {

        const currentToken =
            localStorage.getItem("token");

        if (!currentToken) {

            setUnreadCount(0);

            return;
        }

        try {

            /*
             * The backend now identifies the user
             * from the authenticated JWT.
             *
             * No userId is sent here.
             */

            const response = await API.get(
                "/notifications/count"
            );

            const count = Number(response.data);

            setUnreadCount(
                Number.isFinite(count) && count >= 0
                    ? count
                    : 0
            );

        } catch (err) {

            console.error(
                "Failed to load unread notification count:",
                err
            );

            setUnreadCount(0);
        }

    }, []);

    // ==========================================
    // INITIAL AUTH STATE
    // ==========================================

    useEffect(() => {

        refreshAuthState();

    }, [refreshAuthState]);

    // ==========================================
    // LOAD NOTIFICATION COUNT
    // ==========================================

    useEffect(() => {

        loadUnreadCount();

        const interval = setInterval(
            loadUnreadCount,
            10000
        );

        return () => {
            clearInterval(interval);
        };

    }, [loadUnreadCount]);

    // ==========================================
    // LISTEN FOR AUTH CHANGES
    // ==========================================

    useEffect(() => {

        const handleStorageChange = () => {

            refreshAuthState();
            loadUnreadCount();

        };

        const handleAuthChanged = () => {

            refreshAuthState();
            loadUnreadCount();

        };

        const handleNotificationsChanged = () => {

            loadUnreadCount();

        };

        window.addEventListener(
            "storage",
            handleStorageChange
        );

        window.addEventListener(
            "authChanged",
            handleAuthChanged
        );

        window.addEventListener(
            "notificationsChanged",
            handleNotificationsChanged
        );

        return () => {

            window.removeEventListener(
                "storage",
                handleStorageChange
            );

            window.removeEventListener(
                "authChanged",
                handleAuthChanged
            );

            window.removeEventListener(
                "notificationsChanged",
                handleNotificationsChanged
            );

        };

    }, [
        refreshAuthState,
        loadUnreadCount
    ]);

    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        setToken(null);
        setUserId(null);
        setRole(null);
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
    // NOT LOGGED IN
    // ==========================================

    if (!token) {

        return (

            <nav className="
                bg-white
                shadow-md
                px-6
                py-4
            ">

                <div className="
                    max-w-7xl
                    mx-auto
                    flex
                    items-center
                    justify-between
                ">

                    <Link
                        to="/login"
                        className="
                            text-2xl
                            font-bold
                            text-blue-600
                        "
                    >
                        Job Portal
                    </Link>

                    <div className="
                        flex
                        items-center
                        gap-4
                    ">

                        <Link
                            to="/login"
                            className="
                                text-gray-700
                                hover:text-blue-600
                                font-medium
                            "
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                px-4
                                py-2
                                rounded-lg
                                font-medium
                            "
                        >
                            Register
                        </Link>

                    </div>

                </div>

            </nav>
        );
    }

    // ==========================================
    // NAVIGATION
    // ==========================================

    return (

        <nav className="
            bg-white
            shadow-md
            px-6
            py-4
            sticky
            top-0
            z-50
        ">

            <div className="
                max-w-7xl
                mx-auto
                flex
                items-center
                justify-between
                gap-6
            ">

                {/* ==================================
                    LOGO
                ================================== */}

                <Link
                    to="/dashboard"
                    className="
                        text-2xl
                        font-bold
                        text-blue-600
                        whitespace-nowrap
                    "
                >
                    Job Portal
                </Link>

                {/* ==================================
                    NAVIGATION LINKS
                ================================== */}

                <div className="
                    flex
                    items-center
                    gap-5
                    flex-wrap
                ">

                    {/* HOME */}

                    <Link
                        to="/dashboard"
                        className="
                            text-gray-700
                            hover:text-blue-600
                            font-medium
                        "
                    >
                        Home
                    </Link>

                    {/* JOB SEEKER */}

                    {role === "ROLE_JOB_SEEKER" && (

                        <>
                            <Link
                                to="/jobs"
                                className="
                                    text-gray-700
                                    hover:text-blue-600
                                    font-medium
                                "
                            >
                                Jobs
                            </Link>

                            <Link
                                to="/saved-jobs"
                                className="
                                    text-gray-700
                                    hover:text-blue-600
                                    font-medium
                                "
                            >
                                Saved Jobs
                            </Link>

                            <Link
                                to="/my-applications"
                                className="
                                    text-gray-700
                                    hover:text-blue-600
                                    font-medium
                                "
                            >
                                Applications
                            </Link>

                            <Link
                                to="/my-interviews"
                                className="
                                    text-gray-700
                                    hover:text-blue-600
                                    font-medium
                                "
                            >
                                Interviews
                            </Link>

                            <Link
                                to="/profile"
                                className="
                                    text-gray-700
                                    hover:text-blue-600
                                    font-medium
                                "
                            >
                                Profile
                            </Link>
                        </>

                    )}

                    {/* EMPLOYER */}

                    {role === "ROLE_EMPLOYER" && (

                        <>
                            <Link
                                to="/employer-dashboard"
                                className="
                                    text-gray-700
                                    hover:text-blue-600
                                    font-medium
                                "
                            >
                                Dashboard
                            </Link>

                            <Link
                                to="/add-job"
                                className="
                                    text-gray-700
                                    hover:text-blue-600
                                    font-medium
                                "
                            >
                                Add Job
                            </Link>

                            <Link
                                to="/manage-applications"
                                className="
                                    text-gray-700
                                    hover:text-blue-600
                                    font-medium
                                "
                            >
                                Applications
                            </Link>

                            <Link
                                to="/manage-interviews"
                                className="
                                    text-gray-700
                                    hover:text-blue-600
                                    font-medium
                                "
                            >
                                Interviews
                            </Link>

                            <Link
                                to="/analytics"
                                className="
                                    text-gray-700
                                    hover:text-blue-600
                                    font-medium
                                "
                            >
                                Analytics
                            </Link>

                            <Link
                                to="/employer-profile"
                                className="
                                    text-gray-700
                                    hover:text-blue-600
                                    font-medium
                                "
                            >
                                Profile
                            </Link>
                        </>

                    )}

                    {/* RECRUITER */}

                    {role === "ROLE_RECRUITER" && (

                        <>
                            <Link
                                to="/recruiter-dashboard"
                                className="
                                    text-gray-700
                                    hover:text-blue-600
                                    font-medium
                                "
                            >
                                Dashboard
                            </Link>

                            <Link
                                to="/manage-applications"
                                className="
                                    text-gray-700
                                    hover:text-blue-600
                                    font-medium
                                "
                            >
                                Applications
                            </Link>

                            <Link
                                to="/manage-interviews"
                                className="
                                    text-gray-700
                                    hover:text-blue-600
                                    font-medium
                                "
                            >
                                Interviews
                            </Link>

                            <Link
                                to="/analytics"
                                className="
                                    text-gray-700
                                    hover:text-blue-600
                                    font-medium
                                "
                            >
                                Analytics
                            </Link>
                        </>

                    )}

                    {/* ADMIN */}

                    {role === "ROLE_ADMIN" && (

                        <Link
                            to="/dashboard"
                            className="
                                text-gray-700
                                hover:text-blue-600
                                font-medium
                            "
                        >
                            Admin Dashboard
                        </Link>

                    )}

                    {/* ==================================
                        NOTIFICATIONS
                    ================================== */}

                    <Link
                        to="/notifications"
                        className="
                            relative
                            text-gray-700
                            hover:text-blue-600
                            font-medium
                            flex
                            items-center
                            gap-1
                        "
                    >

                        <span className="text-xl">
                            🔔
                        </span>

                        <span>
                            Notifications
                        </span>

                        {unreadCount > 0 && (

                            <span className="
                                absolute
                                -top-3
                                -right-3
                                bg-red-500
                                text-white
                                text-xs
                                font-bold
                                min-w-[20px]
                                h-5
                                px-1
                                rounded-full
                                flex
                                items-center
                                justify-center
                            ">
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
                        onClick={logout}
                        className="
                            bg-red-500
                            hover:bg-red-600
                            text-white
                            px-4
                            py-2
                            rounded-lg
                            font-medium
                            transition
                        "
                    >
                        Logout
                    </button>

                </div>

            </div>

        </nav>
    );
}

export default Navbar;

