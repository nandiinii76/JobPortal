import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function ManageApplications() {

    const navigate = useNavigate();

    // =====================================================
    // STATE
    // =====================================================

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");

    // =====================================================
    // AUTH
    // =====================================================

    const employerId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // =====================================================
    // LOAD APPLICATIONS
    // =====================================================

    const loadApplications = useCallback(async () => {

        const currentEmployerId =
            localStorage.getItem("userId");

        const currentToken =
            localStorage.getItem("token");

        const currentRole =
            localStorage.getItem("role");

        // -------------------------------------------------
        // LOGIN CHECK
        // -------------------------------------------------

        if (!currentToken) {

            setError("Please login first.");
            setApplications([]);
            setLoading(false);

            return;
        }

        // -------------------------------------------------
        // EMPLOYER ID CHECK
        // -------------------------------------------------

        if (!currentEmployerId) {

            setError("Employer ID not found.");
            setApplications([]);
            setLoading(false);

            return;
        }

        // -------------------------------------------------
        // ROLE CHECK
        // -------------------------------------------------

        if (
            currentRole !== "ROLE_EMPLOYER" &&
            currentRole !== "EMPLOYER"
        ) {

            setError(
                "Only employers can manage applications."
            );

            setApplications([]);
            setLoading(false);

            return;
        }

        try {

            setError("");

            /*
             * Backend:
             *
             * GET /applications/employer/{employerId}
             */

            const response = await API.get(
                `/applications/employer/${currentEmployerId}`
            );

            console.log(
                "EMPLOYER APPLICATIONS:",
                response.data
            );

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            // -------------------------------------------------
            // SORT NEWEST FIRST
            // -------------------------------------------------

            data.sort((a, b) => {

                const dateA =
                    a?.createdAt
                        ? new Date(a.createdAt).getTime()
                        : 0;

                const dateB =
                    b?.createdAt
                        ? new Date(b.createdAt).getTime()
                        : 0;

                return dateB - dateA;

            });

            setApplications(data);

        } catch (err) {

            console.error(
                "Unable to load applications:",
                err
            );

            console.error(
                "Server response:",
                err.response?.data
            );

            setApplications([]);

            if (err.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else if (err.response?.status === 403) {

                setError(
                    "You are not authorized to manage applications."
                );

            } else {

                setError(
                    "Unable to load applications."
                );

            }

        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    }, []);

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadApplications();

    }, [loadApplications]);

    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = async () => {

        setRefreshing(true);

        await loadApplications();

    };

    // =====================================================
    // UPDATE APPLICATION STATUS
    // =====================================================

    const updateStatus = async (
        applicationId,
        newStatus
    ) => {

        if (!applicationId) {

            setError(
                "Application ID is missing."
            );

            return;

        }

        if (!newStatus) {

            setError(
                "Application status is required."
            );

            return;

        }

        // -------------------------------------------------
        // CONFIRM HIRING
        // -------------------------------------------------

        if (newStatus === "HIRED") {

            const confirmed =
                window.confirm(
                    "Are you sure you want to hire this candidate?"
                );

            if (!confirmed) {
                return;
            }

        }

        // -------------------------------------------------
        // CONFIRM REJECTION
        // -------------------------------------------------

        if (newStatus === "REJECTED") {

            const confirmed =
                window.confirm(
                    "Are you sure you want to reject this candidate?"
                );

            if (!confirmed) {
                return;
            }

        }

        try {

            setUpdatingId(applicationId);
            setError("");

            /*
             * Backend:
             *
             * PUT /applications/{id}/status?status=SHORTLISTED
             */

            const response = await API.put(
                `/applications/${applicationId}/status`,
                null,
                {
                    params: {
                        status: newStatus
                    }
                }
            );

            console.log(
                "STATUS UPDATE RESPONSE:",
                response.data
            );

            // -------------------------------------------------
            // UPDATE LOCAL STATE
            // -------------------------------------------------

            setApplications(
                previousApplications =>
                    previousApplications.map(
                        application =>
                            application.id === applicationId
                                ? {
                                    ...application,
                                    status: newStatus,
                                    updatedAt:
                                        new Date().toISOString()
                                }
                                : application
                    )
            );

            // -------------------------------------------------
            // NOTIFY OTHER COMPONENTS
            // -------------------------------------------------

            window.dispatchEvent(
                new Event("notificationsChanged")
            );

            window.dispatchEvent(
                new Event("applicationsChanged")
            );

        } catch (err) {

            console.error(
                "Failed to update application:",
                err
            );

            console.error(
                "Server response:",
                err.response?.data
            );

            if (err.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else if (err.response?.status === 403) {

                setError(
                    "You are not authorized to update this application."
                );

            } else {

                const message =
                    typeof err.response?.data === "string"
                        ? err.response.data
                        : err.response?.data?.message;

                setError(
                    message ||
                    "Failed to update application status."
                );

            }

        } finally {

            setUpdatingId(null);

        }

    };

    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {

        switch (status?.trim().toUpperCase()) {

            case "APPLIED":
                return "bg-blue-100 text-blue-700";

            case "SHORTLISTED":
                return "bg-yellow-100 text-yellow-700";

            case "INTERVIEW":
                return "bg-purple-100 text-purple-700";

            case "HIRED":
                return "bg-green-100 text-green-700";

            case "REJECTED":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";

        }

    };

    // =====================================================
    // STATUS ICON
    // =====================================================

    const getStatusIcon = (status) => {

        switch (status?.trim().toUpperCase()) {

            case "APPLIED":
                return "📝";

            case "SHORTLISTED":
                return "⭐";

            case "INTERVIEW":
                return "🎤";

            case "HIRED":
                return "🎉";

            case "REJECTED":
                return "❌";

            default:
                return "📋";

        }

    };

    // =====================================================
    // STATUS TEXT
    // =====================================================

    const getStatusText = (status) => {

        if (!status) {
            return "APPLIED";
        }

        return status
            .trim()
            .toUpperCase();

    };

    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "N/A";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="
                min-h-screen
                bg-gray-100
                flex
                items-center
                justify-center
                p-6
            ">

                <div className="
                    bg-white
                    rounded-xl
                    shadow-md
                    p-10
                    text-center
                ">

                    <div className="text-5xl mb-4">
                        ⏳
                    </div>

                    <h2 className="
                        text-2xl
                        font-bold
                        text-gray-800
                    ">
                        Loading Applications...
                    </h2>

                    <p className="
                        text-gray-500
                        mt-2
                    ">
                        Fetching candidate applications.
                    </p>

                </div>

            </div>

        );

    }

    // =====================================================
    // STATISTICS
    // =====================================================

    const totalApplications =
        applications.length;

    const appliedCount =
        applications.filter(
            app =>
                app.status?.toUpperCase() ===
                "APPLIED"
        ).length;

    const shortlistedCount =
        applications.filter(
            app =>
                app.status?.toUpperCase() ===
                "SHORTLISTED"
        ).length;

    const interviewCount =
        applications.filter(
            app =>
                app.status?.toUpperCase() ===
                "INTERVIEW"
        ).length;

    const hiredCount =
        applications.filter(
            app =>
                app.status?.toUpperCase() ===
                "HIRED"
        ).length;

    const rejectedCount =
        applications.filter(
            app =>
                app.status?.toUpperCase() ===
                "REJECTED"
        ).length;

    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="
            min-h-screen
            bg-gray-100
            p-6
            md:p-8
        ">

            <div className="
                max-w-7xl
                mx-auto
            ">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between
                    gap-4
                    mb-8
                ">

                    <div>

                        <h1 className="
                            text-3xl
                            md:text-4xl
                            font-bold
                            text-gray-900
                        ">
                            Manage Applications
                        </h1>

                        <p className="
                            text-gray-500
                            mt-2
                        ">
                            Review candidates and manage their
                            application status.
                        </p>

                    </div>

                    <div className="
                        flex
                        flex-wrap
                        gap-3
                    ">

                        <Link
                            to="/add-job"
                            className="
                                bg-green-600
                                hover:bg-green-700
                                text-white
                                px-5
                                py-3
                                rounded-lg
                                font-semibold
                                transition
                            "
                        >
                            + Post Job
                        </Link>

                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="
                                bg-blue-600
                                hover:bg-blue-700
                                disabled:bg-gray-400
                                text-white
                                px-5
                                py-3
                                rounded-lg
                                font-semibold
                                transition
                            "
                        >

                            {refreshing
                                ? "Refreshing..."
                                : "🔄 Refresh"}

                        </button>

                    </div>

                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="
                        bg-red-100
                        border
                        border-red-300
                        text-red-700
                        px-5
                        py-4
                        rounded-lg
                        mb-6
                    ">

                        <p className="font-semibold">
                            {error}
                        </p>

                        {error.includes("session") && (

                            <button
                                onClick={() =>
                                    navigate("/login")
                                }
                                className="
                                    mt-3
                                    bg-red-600
                                    hover:bg-red-700
                                    text-white
                                    px-4
                                    py-2
                                    rounded-lg
                                "
                            >
                                Login Again
                            </button>

                        )}

                    </div>

                )}

                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-6
                    gap-4
                    mb-8
                ">

                    {/* TOTAL */}

                    <div className="
                        bg-white
                        rounded-xl
                        shadow
                        p-5
                    ">

                        <p className="text-gray-500">
                            Total
                        </p>

                        <p className="
                            text-3xl
                            font-bold
                            text-gray-900
                            mt-2
                        ">
                            {totalApplications}
                        </p>

                    </div>

                    {/* APPLIED */}

                    <div className="
                        bg-white
                        rounded-xl
                        shadow
                        p-5
                    ">

                        <p className="text-gray-500">
                            Applied
                        </p>

                        <p className="
                            text-3xl
                            font-bold
                            text-blue-600
                            mt-2
                        ">
                            {appliedCount}
                        </p>

                    </div>

                    {/* SHORTLISTED */}

                    <div className="
                        bg-white
                        rounded-xl
                        shadow
                        p-5
                    ">

                        <p className="text-gray-500">
                            Shortlisted
                        </p>

                        <p className="
                            text-3xl
                            font-bold
                            text-yellow-600
                            mt-2
                        ">
                            {shortlistedCount}
                        </p>

                    </div>

                    {/* INTERVIEW */}

                    <div className="
                        bg-white
                        rounded-xl
                        shadow
                        p-5
                    ">

                        <p className="text-gray-500">
                            Interview
                        </p>

                        <p className="
                            text-3xl
                            font-bold
                            text-purple-600
                            mt-2
                        ">
                            {interviewCount}
                        </p>

                    </div>

                    {/* HIRED */}

                    <div className="
                        bg-white
                        rounded-xl
                        shadow
                        p-5
                    ">

                        <p className="text-gray-500">
                            Hired
                        </p>

                        <p className="
                            text-3xl
                            font-bold
                            text-green-600
                            mt-2
                        ">
                            {hiredCount}
                        </p>

                    </div>

                    {/* REJECTED */}

                    <div className="
                        bg-white
                        rounded-xl
                        shadow
                        p-5
                    ">

                        <p className="text-gray-500">
                            Rejected
                        </p>

                        <p className="
                            text-3xl
                            font-bold
                            text-red-600
                            mt-2
                        ">
                            {rejectedCount}
                        </p>

                    </div>

                </div>

                {/* =================================================
                    EMPTY
                ================================================= */}

                {applications.length === 0 ? (

                    <div className="
                        bg-white
                        rounded-xl
                        shadow
                        p-12
                        text-center
                    ">

                        <div className="text-6xl mb-5">
                            📄
                        </div>

                        <h2 className="
                            text-2xl
                            font-bold
                            text-gray-800
                        ">
                            No Applications Found
                        </h2>

                        <p className="
                            text-gray-500
                            mt-2
                        ">
                            Applications from candidates will
                            appear here.
                        </p>

                        <Link
                            to="/add-job"
                            className="
                                inline-block
                                mt-6
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                px-6
                                py-3
                                rounded-lg
                                font-semibold
                            "
                        >
                            Post a Job
                        </Link>

                    </div>

                ) : (

                    /* =================================================
                       APPLICATION TABLE
                    ================================================= */

                    <div className="
                        bg-white
                        rounded-xl
                        shadow
                        overflow-hidden
                    ">

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="
                                    bg-gray-900
                                    text-white
                                ">

                                    <tr>

                                        <th className="p-4 text-left">
                                            Candidate
                                        </th>

                                        <th className="p-4 text-left">
                                            Email
                                        </th>

                                        <th className="p-4 text-left">
                                            Job
                                        </th>

                                        <th className="p-4 text-left">
                                            Applied
                                        </th>

                                        <th className="p-4 text-left">
                                            Status
                                        </th>

                                        <th className="p-4 text-left">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {applications.map(
                                        application => {

                                            const status =
                                                getStatusText(
                                                    application.status
                                                );

                                            const isUpdating =
                                                updatingId ===
                                                application.id;

                                            const isFinalStatus =
                                                status === "HIRED" ||
                                                status === "REJECTED";

                                            return (

                                                <tr
                                                    key={
                                                        application.id
                                                    }
                                                    className="
                                                        border-b
                                                        hover:bg-gray-50
                                                        transition
                                                    "
                                                >

                                                    {/* CANDIDATE */}

                                                    <td className="p-4">

                                                        <div className="
                                                            font-semibold
                                                            text-gray-900
                                                        ">

                                                            {
                                                                application.user?.name ||
                                                                "Unknown Candidate"
                                                            }

                                                        </div>

                                                        <div className="
                                                            text-sm
                                                            text-gray-400
                                                            mt-1
                                                        ">

                                                            ID:{" "}

                                                            {
                                                                application.user?.id ||
                                                                "-"
                                                            }

                                                        </div>

                                                    </td>

                                                    {/* EMAIL */}

                                                    <td className="
                                                        p-4
                                                        text-gray-700
                                                    ">

                                                        {
                                                            application.user?.email ||
                                                            "No email"
                                                        }

                                                    </td>

                                                    {/* JOB */}

                                                    <td className="p-4">

                                                        <div className="
                                                            font-semibold
                                                            text-gray-900
                                                        ">

                                                            {
                                                                application.job?.title ||
                                                                "Unknown Job"
                                                            }

                                                        </div>

                                                        <div className="
                                                            text-sm
                                                            text-gray-500
                                                            mt-1
                                                        ">

                                                            {
                                                                application.job?.company ||
                                                                "Company unavailable"
                                                            }

                                                        </div>

                                                    </td>

                                                    {/* DATE */}

                                                    <td className="
                                                        p-4
                                                        text-gray-600
                                                        whitespace-nowrap
                                                    ">

                                                        {
                                                            formatDate(
                                                                application.createdAt
                                                            )
                                                        }

                                                    </td>

                                                    {/* STATUS */}

                                                    <td className="p-4">

                                                        <span
                                                            className={`
                                                                inline-flex
                                                                items-center
                                                                gap-2
                                                                px-3
                                                                py-1
                                                                rounded-full
                                                                text-sm
                                                                font-semibold
                                                                ${getStatusClass(status)}
                                                            `}
                                                        >

                                                            <span>
                                                                {
                                                                    getStatusIcon(
                                                                        status
                                                                    )
                                                                }
                                                            </span>

                                                            {status}

                                                        </span>

                                                    </td>

                                                    {/* ACTIONS */}

                                                    <td className="p-4">

                                                        <div className="
                                                            flex
                                                            flex-wrap
                                                            gap-2
                                                        ">

                                                            {/* SHORTLIST */}

                                                            {!isFinalStatus &&
                                                                status === "APPLIED" && (

                                                                <button
                                                                    disabled={
                                                                        isUpdating
                                                                    }
                                                                    onClick={() =>
                                                                        updateStatus(
                                                                            application.id,
                                                                            "SHORTLISTED"
                                                                        )
                                                                    }
                                                                    className="
                                                                        bg-yellow-500
                                                                        hover:bg-yellow-600
                                                                        disabled:bg-gray-400
                                                                        text-white
                                                                        px-3
                                                                        py-2
                                                                        rounded-lg
                                                                        text-sm
                                                                        font-semibold
                                                                    "
                                                                >

                                                                    {
                                                                        isUpdating
                                                                            ? "..."
                                                                            : "Shortlist"
                                                                    }

                                                                </button>

                                                            )}

                                                            {/* INTERVIEW */}

                                                            {!isFinalStatus &&
                                                                (
                                                                    status === "SHORTLISTED" ||
                                                                    status === "APPLIED"
                                                                ) && (

                                                                <Link
                                                                    to={`/schedule-interview/${application.id}`}
                                                                    className="
                                                                        bg-purple-600
                                                                        hover:bg-purple-700
                                                                        text-white
                                                                        px-3
                                                                        py-2
                                                                        rounded-lg
                                                                        text-sm
                                                                        font-semibold
                                                                    "
                                                                >
                                                                    Schedule Interview
                                                                </Link>

                                                            )}

                                                            {/* VIEW INTERVIEW */}

                                                            {status === "INTERVIEW" && (

                                                                <Link
                                                                    to="/manage-interviews"
                                                                    className="
                                                                        bg-purple-100
                                                                        hover:bg-purple-200
                                                                        text-purple-700
                                                                        px-3
                                                                        py-2
                                                                        rounded-lg
                                                                        text-sm
                                                                        font-semibold
                                                                    "
                                                                >
                                                                    View Interview
                                                                </Link>

                                                            )}

                                                            {/* HIRE */}

                                                            {!isFinalStatus &&
                                                                status !== "HIRED" && (

                                                                <button
                                                                    disabled={
                                                                        isUpdating
                                                                    }
                                                                    onClick={() =>
                                                                        updateStatus(
                                                                            application.id,
                                                                            "HIRED"
                                                                        )
                                                                    }
                                                                    className="
                                                                        bg-green-600
                                                                        hover:bg-green-700
                                                                        disabled:bg-gray-400
                                                                        text-white
                                                                        px-3
                                                                        py-2
                                                                        rounded-lg
                                                                        text-sm
                                                                        font-semibold
                                                                    "
                                                                >

                                                                    {
                                                                        isUpdating
                                                                            ? "..."
                                                                            : "Hire"
                                                                    }

                                                                </button>

                                                            )}

                                                            {/* REJECT */}

                                                            {!isFinalStatus &&
                                                                status !== "REJECTED" && (

                                                                <button
                                                                    disabled={
                                                                        isUpdating
                                                                    }
                                                                    onClick={() =>
                                                                        updateStatus(
                                                                            application.id,
                                                                            "REJECTED"
                                                                        )
                                                                    }
                                                                    className="
                                                                        bg-red-600
                                                                        hover:bg-red-700
                                                                        disabled:bg-gray-400
                                                                        text-white
                                                                        px-3
                                                                        py-2
                                                                        rounded-lg
                                                                        text-sm
                                                                        font-semibold
                                                                    "
                                                                >

                                                                    {
                                                                        isUpdating
                                                                            ? "..."
                                                                            : "Reject"
                                                                    }

                                                                </button>

                                                            )}

                                                        </div>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}

            </div>

        </div>

    );

}

export default ManageApplications;