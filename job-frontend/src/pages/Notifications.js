import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function Notifications() {

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState(null);
    const [markingAll, setMarkingAll] = useState(false);

    // ==========================================
    // GET CURRENT USER
    // ==========================================

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    // ==========================================
    // LOAD NOTIFICATIONS
    // ==========================================

    const loadNotifications = useCallback(async () => {

        if (!userId || !token) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        try {

            setLoading(true);
            setError("");

            const response = await API.get(
                `/notifications/user/${userId}`
            );

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            setNotifications(data);

        } catch (err) {

            console.error(
                "Failed to load notifications:",
                err
            );

            if (err.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else if (err.response?.status === 403) {

                setError(
                    "You are not authorized to view notifications."
                );

            } else {

                setError(
                    "Unable to load notifications."
                );
            }

        } finally {

            setLoading(false);

        }

    }, [userId, token]);

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        loadNotifications();

    }, [loadNotifications]);

    // ==========================================
    // NOTIFY NAVBAR
    // ==========================================

    const notifyNavbar = () => {

        window.dispatchEvent(
            new Event("notificationsChanged")
        );
    };

    // ==========================================
    // CHECK UNREAD
    // ==========================================

    const isNotificationUnread = (notification) => {

        // Backend returns "read" as JSON property
        if (typeof notification.read === "boolean") {
            return !notification.read;
        }

        // Fallback in case API returns "isRead"
        if (typeof notification.isRead === "boolean") {
            return !notification.isRead;
        }

        return false;
    };

    // ==========================================
    // MARK ONE AS READ
    // ==========================================

    const markAsRead = async (notificationId) => {

        try {

            setProcessingId(notificationId);
            setError("");

            await API.put(
                `/notifications/${notificationId}/read`
            );

            setNotifications((previous) =>
                previous.map((notification) =>
                    notification.id === notificationId
                        ? {
                            ...notification,
                            read: true,
                            isRead: true
                        }
                        : notification
                )
            );

            notifyNavbar();

        } catch (err) {

            console.error(
                "Failed to mark notification as read:",
                err
            );

            setError(
                "Unable to mark notification as read."
            );

        } finally {

            setProcessingId(null);

        }
    };

    // ==========================================
    // MARK ALL AS READ
    // ==========================================

    const markAllAsRead = async () => {

        if (!userId) {
            return;
        }

        try {

            setMarkingAll(true);
            setError("");

            await API.put(
                `/notifications/user/${userId}/read-all`
            );

            setNotifications((previous) =>
                previous.map((notification) => ({
                    ...notification,
                    read: true,
                    isRead: true
                }))
            );

            notifyNavbar();

        } catch (err) {

            console.error(
                "Failed to mark all notifications as read:",
                err
            );

            setError(
                "Unable to mark all notifications as read."
            );

        } finally {

            setMarkingAll(false);

        }
    };

    // ==========================================
    // DELETE ONE NOTIFICATION
    // ==========================================

    const deleteNotification = async (notificationId) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this notification?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setProcessingId(notificationId);
            setError("");

            await API.delete(
                `/notifications/${notificationId}`
            );

            setNotifications((previous) =>
                previous.filter(
                    (notification) =>
                        notification.id !== notificationId
                )
            );

            notifyNavbar();

        } catch (err) {

            console.error(
                "Failed to delete notification:",
                err
            );

            setError(
                "Unable to delete notification."
            );

        } finally {

            setProcessingId(null);

        }
    };

    // ==========================================
    // DELETE ALL NOTIFICATIONS
    // ==========================================

    const deleteAllNotifications = async () => {

        if (!userId) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete all notifications?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setMarkingAll(true);
            setError("");

            await API.delete(
                `/notifications/user/${userId}`
            );

            setNotifications([]);

            notifyNavbar();

        } catch (err) {

            console.error(
                "Failed to delete all notifications:",
                err
            );

            setError(
                "Unable to delete all notifications."
            );

        } finally {

            setMarkingAll(false);

        }
    };

    // ==========================================
    // REFRESH
    // ==========================================

    const handleRefresh = async () => {

        await loadNotifications();

        notifyNavbar();
    };

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (dateValue) => {

        if (!dateValue) {
            return "Unknown date";
        }

        try {

            const date = new Date(dateValue);

            if (Number.isNaN(date.getTime())) {
                return "Unknown date";
            }

            return date.toLocaleString(
                "en-IN",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            );

        } catch {

            return "Unknown date";
        }
    };

    // ==========================================
    // NOT LOGGED IN
    // ==========================================

    if (!token || !userId) {

        return (

            <div className="
                min-h-screen
                bg-gray-100
                flex
                items-center
                justify-center
                px-6
            ">

                <div className="
                    bg-white
                    shadow-lg
                    rounded-xl
                    p-8
                    text-center
                    max-w-md
                    w-full
                ">

                    <div className="
                        text-5xl
                        mb-4
                    ">
                        🔒
                    </div>

                    <h2 className="
                        text-2xl
                        font-bold
                        text-gray-800
                        mb-4
                    ">
                        Login Required
                    </h2>

                    <p className="
                        text-gray-600
                        mb-6
                    ">
                        Please login to view your notifications.
                    </p>

                    <Link
                        to="/login"
                        className="
                            inline-block
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            px-6
                            py-3
                            rounded-lg
                            transition
                            font-medium
                        "
                    >
                        Go to Login
                    </Link>

                </div>

            </div>
        );
    }

    // ==========================================
    // UNREAD COUNT
    // ==========================================

    const unreadCount = notifications.filter(
        isNotificationUnread
    ).length;

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="
                min-h-screen
                bg-gray-100
                flex
                items-center
                justify-center
            ">

                <div className="
                    bg-white
                    rounded-xl
                    shadow-md
                    px-8
                    py-6
                    text-center
                ">

                    <div className="
                        text-4xl
                        mb-3
                    ">
                        🔔
                    </div>

                    <div className="
                        text-lg
                        font-semibold
                        text-gray-600
                    ">
                        Loading notifications...
                    </div>

                </div>

            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="
            min-h-screen
            bg-gray-100
            py-10
            px-6
        ">

            <div className="
                max-w-4xl
                mx-auto
            ">

                {/* ==================================
                    HEADER
                ================================== */}

                <div className="
                    bg-white
                    rounded-xl
                    shadow-md
                    p-6
                    mb-6
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between
                    gap-4
                ">

                    <div>

                        <div className="
                            flex
                            items-center
                            gap-3
                        ">

                            <span className="text-3xl">
                                🔔
                            </span>

                            <h1 className="
                                text-3xl
                                font-bold
                                text-gray-800
                            ">
                                Notifications
                            </h1>

                        </div>

                        <p className="
                            text-gray-500
                            mt-2
                        ">

                            {unreadCount > 0
                                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                                : "You're all caught up!"}

                        </p>

                    </div>

                    {/* ==================================
                        ACTIONS
                    ================================== */}

                    <div className="
                        flex
                        gap-3
                        flex-wrap
                    ">

                        <button
                            onClick={handleRefresh}
                            className="
                                bg-gray-200
                                hover:bg-gray-300
                                text-gray-800
                                px-4
                                py-2
                                rounded-lg
                                transition
                                font-medium
                            "
                        >
                            ↻ Refresh
                        </button>

                        {unreadCount > 0 && (

                            <button
                                onClick={markAllAsRead}
                                disabled={markingAll}
                                className="
                                    bg-blue-600
                                    hover:bg-blue-700
                                    text-white
                                    px-4
                                    py-2
                                    rounded-lg
                                    transition
                                    font-medium
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                "
                            >
                                {markingAll
                                    ? "Marking..."
                                    : "Mark All Read"}
                            </button>

                        )}

                        {notifications.length > 0 && (

                            <button
                                onClick={deleteAllNotifications}
                                disabled={markingAll}
                                className="
                                    bg-red-500
                                    hover:bg-red-600
                                    text-white
                                    px-4
                                    py-2
                                    rounded-lg
                                    transition
                                    font-medium
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                "
                            >
                                {markingAll
                                    ? "Deleting..."
                                    : "Delete All"}
                            </button>

                        )}

                    </div>

                </div>

                {/* ==================================
                    ERROR
                ================================== */}

                {error && (

                    <div className="
                        bg-red-50
                        border
                        border-red-300
                        text-red-700
                        px-5
                        py-4
                        rounded-lg
                        mb-6
                        flex
                        items-center
                        justify-between
                        gap-4
                    ">

                        <span>
                            {error}
                        </span>

                        <button
                            onClick={() => setError("")}
                            className="
                                text-red-700
                                hover:text-red-900
                                font-bold
                            "
                        >
                            ✕
                        </button>

                    </div>

                )}

                {/* ==================================
                    NO NOTIFICATIONS
                ================================== */}

                {notifications.length === 0 ? (

                    <div className="
                        bg-white
                        rounded-xl
                        shadow-md
                        p-12
                        text-center
                    ">

                        <div className="
                            text-6xl
                            mb-5
                        ">
                            🔔
                        </div>

                        <h2 className="
                            text-2xl
                            font-bold
                            text-gray-800
                            mb-2
                        ">
                            No Notifications
                        </h2>

                        <p className="
                            text-gray-500
                            mb-6
                        ">
                            You don't have any notifications yet.
                        </p>

                        <Link
                            to="/jobs"
                            className="
                                inline-block
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                px-6
                                py-3
                                rounded-lg
                                transition
                                font-medium
                            "
                        >
                            Browse Jobs
                        </Link>

                    </div>

                ) : (

                    /* ==================================
                       NOTIFICATION LIST
                    ================================== */

                    <div className="space-y-4">

                        {notifications.map(
                            (notification) => {

                                const isUnread =
                                    isNotificationUnread(
                                        notification
                                    );

                                return (

                                    <div
                                        key={notification.id}
                                        className={`
                                            rounded-xl
                                            shadow-md
                                            p-5
                                            border-l-4
                                            transition
                                            ${
                                                isUnread
                                                    ? "bg-blue-50 border-blue-600"
                                                    : "bg-white border-gray-300"
                                            }
                                        `}
                                    >

                                        <div className="
                                            flex
                                            flex-col
                                            md:flex-row
                                            md:items-start
                                            md:justify-between
                                            gap-4
                                        ">

                                            {/* ==================================
                                                CONTENT
                                            ================================== */}

                                            <div className="
                                                flex
                                                gap-4
                                                flex-1
                                            ">

                                                <div className="
                                                    text-2xl
                                                    flex-shrink-0
                                                ">
                                                    {isUnread
                                                        ? "🔵"
                                                        : "⚪"}
                                                </div>

                                                <div className="flex-1">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                        flex-wrap
                                                    ">

                                                        <p className={`
                                                            text-base
                                                            ${
                                                                isUnread
                                                                    ? "font-semibold text-gray-900"
                                                                    : "text-gray-700"
                                                            }
                                                        `}>
                                                            {
                                                                notification.message
                                                            }
                                                        </p>

                                                        {isUnread && (

                                                            <span className="
                                                                bg-blue-100
                                                                text-blue-700
                                                                text-xs
                                                                font-semibold
                                                                px-2
                                                                py-1
                                                                rounded-full
                                                            ">
                                                                New
                                                            </span>

                                                        )}

                                                    </div>

                                                    <p className="
                                                        text-sm
                                                        text-gray-500
                                                        mt-2
                                                    ">
                                                        {formatDate(
                                                            notification.createdAt
                                                        )}
                                                    </p>

                                                </div>

                                            </div>

                                            {/* ==================================
                                                ACTIONS
                                            ================================== */}

                                            <div className="
                                                flex
                                                gap-2
                                                flex-wrap
                                            ">

                                                {isUnread && (

                                                    <button
                                                        onClick={() =>
                                                            markAsRead(
                                                                notification.id
                                                            )
                                                        }
                                                        disabled={
                                                            processingId ===
                                                            notification.id
                                                        }
                                                        className="
                                                            bg-blue-600
                                                            hover:bg-blue-700
                                                            text-white
                                                            px-3
                                                            py-2
                                                            rounded-lg
                                                            text-sm
                                                            transition
                                                            font-medium
                                                            disabled:opacity-50
                                                            disabled:cursor-not-allowed
                                                        "
                                                    >

                                                        {processingId ===
                                                        notification.id
                                                            ? "..."
                                                            : "Mark Read"}

                                                    </button>

                                                )}

                                                <button
                                                    onClick={() =>
                                                        deleteNotification(
                                                            notification.id
                                                        )
                                                    }
                                                    disabled={
                                                        processingId ===
                                                        notification.id
                                                    }
                                                    className="
                                                        bg-red-100
                                                        hover:bg-red-200
                                                        text-red-700
                                                        px-3
                                                        py-2
                                                        rounded-lg
                                                        text-sm
                                                        transition
                                                        font-medium
                                                        disabled:opacity-50
                                                        disabled:cursor-not-allowed
                                                    "
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                );
                            }
                        )}

                    </div>

                )}

            </div>

        </div>
    );
}

export default Notifications;