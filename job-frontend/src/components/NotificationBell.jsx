import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function NotificationBell() {

    const [unreadCount, setUnreadCount] = useState(0);

    // ==========================================
    // LOAD UNREAD COUNT
    // ==========================================

    const loadUnreadCount = useCallback(async () => {

        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
            setUnreadCount(0);
            return;
        }

        try {

            const response = await API.get(
                `/notifications/user/${userId}/count`
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
    // INITIAL LOAD + POLLING
    // ==========================================

    useEffect(() => {

        loadUnreadCount();

        const interval = setInterval(() => {

            loadUnreadCount();

        }, 10000);

        return () => {

            clearInterval(interval);

        };

    }, [loadUnreadCount]);

    // ==========================================
    // LISTEN FOR NOTIFICATION CHANGES
    // ==========================================

    useEffect(() => {

        const handleNotificationChange = () => {

            loadUnreadCount();

        };

        window.addEventListener(
            "notificationsChanged",
            handleNotificationChange
        );

        window.addEventListener(
            "authChanged",
            handleNotificationChange
        );

        return () => {

            window.removeEventListener(
                "notificationsChanged",
                handleNotificationChange
            );

            window.removeEventListener(
                "authChanged",
                handleNotificationChange
            );

        };

    }, [loadUnreadCount]);

    // ==========================================
    // HIDE WHEN NOT LOGGED IN
    // ==========================================

    if (
        !localStorage.getItem("token") ||
        !localStorage.getItem("userId")
    ) {
        return null;
    }

    // ==========================================
    // UI
    // ==========================================

    return (

        <Link
            to="/notifications"
            title="Notifications"
            className="
                relative
                flex
                items-center
                justify-center
                text-xl
                hover:text-yellow-400
                transition
                duration-200
                w-8
                h-8
            "
        >

            {/* BELL */}

            <span>
                🔔
            </span>


            {/* ==================================
                UNREAD BADGE
            ================================== */}

            {unreadCount > 0 && (

                <span
                    className="
                        absolute
                        -top-1
                        -right-2
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
                        border-2
                        border-gray-900
                    "
                >

                    {unreadCount > 99
                        ? "99+"
                        : unreadCount}

                </span>

            )}

        </Link>
    );
}

export default NotificationBell;