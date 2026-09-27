import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ManageInterviews() {

    const navigate = useNavigate();

    // =====================================================
    // AUTH
    // =====================================================

    const employerId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // =====================================================
    // STATE
    // =====================================================

    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [error, setError] = useState("");

    // =====================================================
    // LOAD INTERVIEWS
    // =====================================================

    const loadInterviews = useCallback(async () => {

        if (!employerId || !token) {
            setLoading(false);
            return;
        }

        try {

            setLoading(true);
            setError("");

            const response = await API.get(
                `/interviews/employer/${employerId}`
            );

            console.log(
                "EMPLOYER INTERVIEWS:",
                response.data
            );

            setInterviews(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "LOAD INTERVIEWS ERROR:",
                error
            );

            setInterviews([]);

            if (error.response) {

                setError(
                    error.response.data?.message ||
                    error.response.data ||
                    "Failed to load interviews."
                );

            } else {

                setError(
                    "Server is not responding."
                );
            }

        } finally {

            setLoading(false);

        }

    }, [employerId, token]);

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        if (!token) {

            alert("Please login first.");

            navigate("/login");

            return;
        }

        if (!employerId) {

            alert("Employer ID not found.");

            navigate("/login");

            return;
        }

        if (role !== "ROLE_EMPLOYER") {

            alert(
                "Only employers can manage interviews."
            );

            navigate("/");

            return;
        }

        loadInterviews();

    }, [
        token,
        employerId,
        role,
        navigate,
        loadInterviews
    ]);

    // =====================================================
    // CANCEL INTERVIEW
    // =====================================================

    const cancelInterview = async (id) => {

        if (!id) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to cancel this interview?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setActionId(id);
            setError("");

            await API.put(
                `/interviews/${id}/cancel`
            );

            alert(
                "Interview cancelled successfully."
            );

            await loadInterviews();

        } catch (error) {

            console.error(
                "CANCEL INTERVIEW ERROR:",
                error
            );

            if (error.response) {

                setError(
                    error.response.data?.message ||
                    error.response.data ||
                    "Failed to cancel interview."
                );

            } else {

                setError(
                    "Server is not responding."
                );
            }

        } finally {

            setActionId(null);

        }
    };

    // =====================================================
    // COMPLETE INTERVIEW
    // =====================================================

    const completeInterview = async (id) => {

        if (!id) {
            return;
        }

        const confirmed = window.confirm(
            "Mark this interview as completed?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setActionId(id);
            setError("");

            await API.put(
                `/interviews/${id}/complete`
            );

            alert(
                "Interview marked as completed."
            );

            await loadInterviews();

        } catch (error) {

            console.error(
                "COMPLETE INTERVIEW ERROR:",
                error
            );

            if (error.response) {

                setError(
                    error.response.data?.message ||
                    error.response.data ||
                    "Failed to complete interview."
                );

            } else {

                setError(
                    "Server is not responding."
                );
            }

        } finally {

            setActionId(null);

        }
    };

    // =====================================================
    // DELETE INTERVIEW
    // =====================================================

    const deleteInterview = async (id) => {

        if (!id) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this interview?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setActionId(id);
            setError("");

            await API.delete(
                `/interviews/${id}`
            );

            alert(
                "Interview deleted successfully."
            );

            await loadInterviews();

        } catch (error) {

            console.error(
                "DELETE INTERVIEW ERROR:",
                error
            );

            if (error.response) {

                setError(
                    error.response.data?.message ||
                    error.response.data ||
                    "Failed to delete interview."
                );

            } else {

                setError(
                    "Server is not responding."
                );
            }

        } finally {

            setActionId(null);

        }
    };

    // =====================================================
    // STATUS STYLE
    // =====================================================

    const getStatusClass = (status) => {

        switch (status?.toUpperCase()) {

            case "SCHEDULED":
                return "bg-blue-100 text-blue-700";

            case "COMPLETED":
                return "bg-green-100 text-green-700";

            case "CANCELLED":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }

    };

    // =====================================================
    // MODE STYLE
    // =====================================================

    const getModeClass = (mode) => {

        switch (mode?.toUpperCase()) {

            case "ONLINE":
                return "bg-purple-100 text-purple-700";

            case "OFFLINE":
                return "bg-orange-100 text-orange-700";

            default:
                return "bg-gray-100 text-gray-700";
        }

    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }

        try {

            return new Date(
                `${date}T00:00:00`
            ).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

        } catch {

            return date;
        }

    };

    // =====================================================
    // FORMAT TIME
    // =====================================================

    const formatTime = (time) => {

        if (!time) {
            return "N/A";
        }

        try {

            const [hours, minutes] =
                time.split(":");

            const date = new Date();

            date.setHours(
                Number(hours),
                Number(minutes),
                0
            );

            return date.toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        } catch {

            return time;
        }

    };

    // =====================================================
    // STATISTICS
    // =====================================================

    const totalInterviews =
        interviews.length;

    const scheduledInterviews =
        interviews.filter(
            interview =>
                interview.status?.toUpperCase()
                === "SCHEDULED"
        ).length;

    const completedInterviews =
        interviews.filter(
            interview =>
                interview.status?.toUpperCase()
                === "COMPLETED"
        ).length;

    const cancelledInterviews =
        interviews.filter(
            interview =>
                interview.status?.toUpperCase()
                === "CANCELLED"
        ).length;

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
            ">

                <div className="
                    bg-white
                    rounded-xl
                    shadow-md
                    p-10
                    text-center
                ">

                    <div className="
                        text-5xl
                        mb-4
                    ">
                        📅
                    </div>

                    <h2 className="
                        text-2xl
                        font-bold
                        text-gray-800
                    ">
                        Loading Interviews...
                    </h2>

                    <p className="
                        text-gray-500
                        mt-2
                    ">
                        Fetching your interview schedules.
                    </p>

                </div>

            </div>
        );
    }

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
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
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
                            Manage Interviews
                        </h1>

                        <p className="
                            text-gray-600
                            mt-2
                        ">
                            Manage candidate interviews,
                            schedules and interview status.
                        </p>

                    </div>

                    <div className="
                        flex
                        flex-wrap
                        gap-3
                    ">

                        <button
                            onClick={loadInterviews}
                            disabled={loading}
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
                            🔄 Refresh
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/manage-applications"
                                )
                            }
                            className="
                                bg-gray-800
                                hover:bg-gray-900
                                text-white
                                px-5
                                py-3
                                rounded-lg
                                font-semibold
                                transition
                            "
                        >
                            Applications
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/employer-dashboard"
                                )
                            }
                            className="
                                bg-gray-200
                                hover:bg-gray-300
                                text-gray-800
                                px-5
                                py-3
                                rounded-lg
                                font-semibold
                                transition
                            "
                        >
                            Dashboard
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
                        rounded-lg
                        px-5
                        py-4
                        mb-6
                    ">

                        <div className="
                            flex
                            items-start
                            justify-between
                            gap-4
                        ">

                            <div>
                                <strong>
                                    Error:
                                </strong>{" "}
                                {error}
                            </div>

                            <button
                                onClick={() =>
                                    setError("")
                                }
                                className="
                                    font-bold
                                    text-red-700
                                "
                            >
                                ✕
                            </button>

                        </div>

                    </div>

                )}

                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-4
                    gap-5
                    mb-8
                ">

                    {/* TOTAL */}

                    <div className="
                        bg-white
                        rounded-xl
                        shadow-md
                        p-6
                    ">

                        <p className="text-gray-500">
                            Total Interviews
                        </p>

                        <h2 className="
                            text-4xl
                            font-bold
                            text-blue-600
                            mt-2
                        ">
                            {totalInterviews}
                        </h2>

                    </div>

                    {/* SCHEDULED */}

                    <div className="
                        bg-white
                        rounded-xl
                        shadow-md
                        p-6
                    ">

                        <p className="text-gray-500">
                            Scheduled
                        </p>

                        <h2 className="
                            text-4xl
                            font-bold
                            text-orange-500
                            mt-2
                        ">
                            {scheduledInterviews}
                        </h2>

                    </div>

                    {/* COMPLETED */}

                    <div className="
                        bg-white
                        rounded-xl
                        shadow-md
                        p-6
                    ">

                        <p className="text-gray-500">
                            Completed
                        </p>

                        <h2 className="
                            text-4xl
                            font-bold
                            text-green-600
                            mt-2
                        ">
                            {completedInterviews}
                        </h2>

                    </div>

                    {/* CANCELLED */}

                    <div className="
                        bg-white
                        rounded-xl
                        shadow-md
                        p-6
                    ">

                        <p className="text-gray-500">
                            Cancelled
                        </p>

                        <h2 className="
                            text-4xl
                            font-bold
                            text-red-600
                            mt-2
                        ">
                            {cancelledInterviews}
                        </h2>

                    </div>

                </div>

                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {interviews.length === 0 ? (

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
                            📅
                        </div>

                        <h2 className="
                            text-2xl
                            font-bold
                            text-gray-800
                        ">
                            No Interviews Scheduled
                        </h2>

                        <p className="
                            text-gray-500
                            mt-3
                        ">
                            Interviews scheduled for your
                            jobs will appear here.
                        </p>

                        <button
                            onClick={() =>
                                navigate(
                                    "/manage-applications"
                                )
                            }
                            className="
                                mt-6
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                px-6
                                py-3
                                rounded-lg
                                font-semibold
                                transition
                            "
                        >
                            Manage Applications
                        </button>

                    </div>

                ) : (

                    /* =================================================
                       INTERVIEW LIST
                    ================================================= */

                    <div className="space-y-6">

                        {interviews.map(
                            (interview) => {

                                const application =
                                    interview.application;

                                const candidate =
                                    application?.user;

                                const job =
                                    application?.job;

                                const status =
                                    interview.status
                                    ?.toUpperCase();

                                const mode =
                                    interview.interviewMode
                                    ?.toUpperCase();

                                const isProcessing =
                                    actionId ===
                                    interview.id;

                                return (

                                    <div
                                        key={interview.id}
                                        className="
                                            bg-white
                                            rounded-xl
                                            shadow-md
                                            overflow-hidden
                                        "
                                    >

                                        {/* =================================================
                                            CARD HEADER
                                        ================================================= */}

                                        <div className="
                                            p-6
                                            border-b
                                            bg-gray-50
                                        ">

                                            <div className="
                                                flex
                                                flex-col
                                                lg:flex-row
                                                lg:items-start
                                                lg:justify-between
                                                gap-4
                                            ">

                                                <div>

                                                    <h2 className="
                                                        text-2xl
                                                        font-bold
                                                        text-blue-600
                                                    ">
                                                        {job?.title ||
                                                            "Job Position"}
                                                    </h2>

                                                    <p className="
                                                        text-gray-600
                                                        mt-2
                                                    ">

                                                        Company:{" "}

                                                        <strong>
                                                            {job?.company ||
                                                                "N/A"}
                                                        </strong>

                                                    </p>

                                                    <p className="
                                                        text-gray-600
                                                    ">

                                                        Candidate:{" "}

                                                        <strong>
                                                            {candidate?.name ||
                                                                "N/A"}
                                                        </strong>

                                                    </p>

                                                    <p className="
                                                        text-gray-600
                                                    ">

                                                        Email:{" "}

                                                        {candidate?.email ||
                                                            "N/A"}

                                                    </p>

                                                </div>

                                                <div className="
                                                    flex
                                                    flex-wrap
                                                    gap-2
                                                ">

                                                    <span
                                                        className={`
                                                            px-4
                                                            py-2
                                                            rounded-full
                                                            font-semibold
                                                            ${getStatusClass(
                                                                status
                                                            )}
                                                        `}
                                                    >
                                                        {status ||
                                                            "UNKNOWN"}
                                                    </span>

                                                    <span
                                                        className={`
                                                            px-4
                                                            py-2
                                                            rounded-full
                                                            font-semibold
                                                            ${getModeClass(
                                                                mode
                                                            )}
                                                        `}
                                                    >
                                                        {mode ||
                                                            "UNKNOWN"}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                        {/* =================================================
                                            INTERVIEW DETAILS
                                        ================================================= */}

                                        <div className="
                                            p-6
                                        ">

                                            <div className="
                                                grid
                                                grid-cols-1
                                                md:grid-cols-2
                                                lg:grid-cols-3
                                                gap-6
                                            ">

                                                {/* DATE */}

                                                <div>

                                                    <p className="
                                                        text-sm
                                                        text-gray-500
                                                        mb-1
                                                    ">
                                                        Interview Date
                                                    </p>

                                                    <p className="
                                                        text-lg
                                                        font-semibold
                                                        text-gray-900
                                                    ">
                                                        📅{" "}
                                                        {formatDate(
                                                            interview.interviewDate
                                                        )}
                                                    </p>

                                                </div>

                                                {/* TIME */}

                                                <div>

                                                    <p className="
                                                        text-sm
                                                        text-gray-500
                                                        mb-1
                                                    ">
                                                        Interview Time
                                                    </p>

                                                    <p className="
                                                        text-lg
                                                        font-semibold
                                                        text-gray-900
                                                    ">
                                                        🕐{" "}
                                                        {formatTime(
                                                            interview.interviewTime
                                                        )}
                                                    </p>

                                                </div>

                                                {/* MODE */}

                                                <div>

                                                    <p className="
                                                        text-sm
                                                        text-gray-500
                                                        mb-1
                                                    ">
                                                        Interview Mode
                                                    </p>

                                                    <p className="
                                                        text-lg
                                                        font-semibold
                                                        text-gray-900
                                                    ">
                                                        {mode ||
                                                            "N/A"}
                                                    </p>

                                                </div>

                                                {/* INTERVIEWER */}

                                                <div>

                                                    <p className="
                                                        text-sm
                                                        text-gray-500
                                                        mb-1
                                                    ">
                                                        Interviewer
                                                    </p>

                                                    <p className="
                                                        font-semibold
                                                        text-gray-900
                                                    ">
                                                        {interview.interviewerName ||
                                                            "N/A"}
                                                    </p>

                                                </div>

                                                {/* INTERVIEWER EMAIL */}

                                                <div>

                                                    <p className="
                                                        text-sm
                                                        text-gray-500
                                                        mb-1
                                                    ">
                                                        Interviewer Email
                                                    </p>

                                                    <p className="
                                                        font-semibold
                                                        text-gray-900
                                                        break-all
                                                    ">
                                                        {interview.interviewerEmail ||
                                                            "N/A"}
                                                    </p>

                                                </div>

                                                {/* APPLICATION ID */}

                                                <div>

                                                    <p className="
                                                        text-sm
                                                        text-gray-500
                                                        mb-1
                                                    ">
                                                        Application ID
                                                    </p>

                                                    <p className="
                                                        font-semibold
                                                        text-gray-900
                                                    ">
                                                        #{application?.id ||
                                                            "N/A"}
                                                    </p>

                                                </div>

                                                {/* ONLINE LINK */}

                                                {mode ===
                                                    "ONLINE" && (

                                                    <div className="
                                                        md:col-span-2
                                                        lg:col-span-3
                                                    ">

                                                        <p className="
                                                            text-sm
                                                            text-gray-500
                                                            mb-1
                                                        ">
                                                            Meeting Link
                                                        </p>

                                                        {interview.meetingLink ? (

                                                            <a
                                                                href={
                                                                    interview.meetingLink
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="
                                                                    inline-block
                                                                    text-blue-600
                                                                    hover:text-blue-800
                                                                    hover:underline
                                                                    font-semibold
                                                                    break-all
                                                                "
                                                            >
                                                                🔗 Join Meeting
                                                            </a>

                                                        ) : (

                                                            <p className="
                                                                text-gray-500
                                                            ">
                                                                No meeting link provided.
                                                            </p>

                                                        )}

                                                    </div>

                                                )}

                                                {/* OFFLINE LOCATION */}

                                                {mode ===
                                                    "OFFLINE" && (

                                                    <div className="
                                                        md:col-span-2
                                                        lg:col-span-3
                                                    ">

                                                        <p className="
                                                            text-sm
                                                            text-gray-500
                                                            mb-1
                                                        ">
                                                            Interview Location
                                                        </p>

                                                        <p className="
                                                            font-semibold
                                                            text-gray-900
                                                        ">
                                                            📍{" "}
                                                            {interview.location ||
                                                                "N/A"}
                                                        </p>

                                                    </div>

                                                )}

                                            </div>

                                            {/* =================================================
                                                NOTES
                                            ================================================= */}

                                            {interview.notes && (

                                                <div className="
                                                    mt-6
                                                    bg-gray-50
                                                    rounded-lg
                                                    p-5
                                                ">

                                                    <p className="
                                                        font-semibold
                                                        text-gray-800
                                                    ">
                                                        Interview Notes
                                                    </p>

                                                    <p className="
                                                        text-gray-600
                                                        mt-2
                                                        whitespace-pre-wrap
                                                    ">
                                                        {interview.notes}
                                                    </p>

                                                </div>

                                            )}

                                            {/* =================================================
                                                ACTIONS
                                            ================================================= */}

                                            <div className="
                                                flex
                                                flex-wrap
                                                gap-3
                                                mt-6
                                                pt-6
                                                border-t
                                            ">

                                                {/* EDIT */}

                                                <button
                                                    disabled={
                                                        isProcessing
                                                    }
                                                    onClick={() =>
                                                        navigate(
                                                            `/edit-interview/${interview.id}`
                                                        )
                                                    }
                                                    className="
                                                        bg-yellow-500
                                                        hover:bg-yellow-600
                                                        disabled:bg-gray-400
                                                        text-white
                                                        px-5
                                                        py-2
                                                        rounded-lg
                                                        font-semibold
                                                        transition
                                                    "
                                                >
                                                    ✏️ Edit
                                                </button>

                                                {/* COMPLETE */}

                                                {status ===
                                                    "SCHEDULED" && (

                                                    <button
                                                        disabled={
                                                            isProcessing
                                                        }
                                                        onClick={() =>
                                                            completeInterview(
                                                                interview.id
                                                            )
                                                        }
                                                        className="
                                                            bg-green-600
                                                            hover:bg-green-700
                                                            disabled:bg-gray-400
                                                            text-white
                                                            px-5
                                                            py-2
                                                            rounded-lg
                                                            font-semibold
                                                            transition
                                                        "
                                                    >
                                                        {isProcessing
                                                            ? "Processing..."
                                                            : "✓ Mark Completed"}
                                                    </button>

                                                )}

                                                {/* CANCEL */}

                                                {status ===
                                                    "SCHEDULED" && (

                                                    <button
                                                        disabled={
                                                            isProcessing
                                                        }
                                                        onClick={() =>
                                                            cancelInterview(
                                                                interview.id
                                                            )
                                                        }
                                                        className="
                                                            bg-orange-600
                                                            hover:bg-orange-700
                                                            disabled:bg-gray-400
                                                            text-white
                                                            px-5
                                                            py-2
                                                            rounded-lg
                                                            font-semibold
                                                            transition
                                                        "
                                                    >
                                                        {isProcessing
                                                            ? "Processing..."
                                                            : "✕ Cancel Interview"}
                                                    </button>

                                                )}

                                                {/* DELETE */}

                                                <button
                                                    disabled={
                                                        isProcessing
                                                    }
                                                    onClick={() =>
                                                        deleteInterview(
                                                            interview.id
                                                        )
                                                    }
                                                    className="
                                                        bg-red-600
                                                        hover:bg-red-700
                                                        disabled:bg-gray-400
                                                        text-white
                                                        px-5
                                                        py-2
                                                        rounded-lg
                                                        font-semibold
                                                        transition
                                                    "
                                                >
                                                    {isProcessing
                                                        ? "Processing..."
                                                        : "🗑 Delete"}
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

export default ManageInterviews;