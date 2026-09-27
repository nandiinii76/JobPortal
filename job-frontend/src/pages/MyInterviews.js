import { useCallback, useEffect, useState } from "react";
import API from "../services/api";

function MyInterviews() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // ==========================================
    // LOAD INTERVIEWS
    // ==========================================

    const loadInterviews = useCallback(async () => {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
            alert("Please login first.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const response = await API.get(
                "/interviews/candidate/" + userId
            );

            console.log("MY INTERVIEWS:", response.data);

            setInterviews(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error(
                "MY INTERVIEWS ERROR:",
                error
            );

            if (error.response) {
                console.error(
                    "SERVER STATUS:",
                    error.response.status
                );

                console.error(
                    "SERVER RESPONSE:",
                    error.response.data
                );

                alert(
                    error.response.data?.message ||
                    error.response.data ||
                    "Failed to load interviews."
                );
            } else {
                alert("Server is not responding.");
            }

            setInterviews([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        loadInterviews();
    }, [loadInterviews]);

    // ==========================================
    // STATUS BADGE
    // ==========================================

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case "SCHEDULED":
                return "bg-blue-100 text-blue-700";

            case "COMPLETED":
                return "bg-green-100 text-green-700";

            case "CANCELLED":
                return "bg-red-100 text-red-700";

            case "RESCHEDULED":
                return "bg-yellow-100 text-yellow-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {
        if (!date) {
            return "Not Available";
        }

        try {
            const parsedDate = new Date(date);

            if (Number.isNaN(parsedDate.getTime())) {
                return date;
            }

            return parsedDate.toLocaleDateString(
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

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex justify-center items-center">
                <div className="text-center">
                    <div className="text-5xl mb-4">
                        📅
                    </div>

                    <h2 className="text-3xl font-bold text-gray-700">
                        Loading Interviews...
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Please wait.
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-6">

            <div className="max-w-6xl mx-auto">

                {/* ==================================
                    HEADER
                ================================== */}

                <div className="flex flex-col md:flex-row justify-between items-center mb-8">

                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">
                            My Interviews
                        </h1>

                        <p className="text-gray-500 mt-2">
                            View your scheduled and completed interviews.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadInterviews}
                        disabled={loading}
                        className="
                            mt-4
                            md:mt-0
                            bg-blue-600
                            hover:bg-blue-700
                            disabled:bg-gray-400
                            text-white
                            px-5
                            py-2
                            rounded-lg
                            font-semibold
                        "
                    >
                        🔄 Refresh
                    </button>

                </div>

                {/* ==================================
                    STATISTICS
                ================================== */}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

                    {/* TOTAL */}

                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Total
                        </p>

                        <p className="text-4xl font-bold text-blue-600 mt-2">
                            {interviews.length}
                        </p>

                    </div>

                    {/* SCHEDULED */}

                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Scheduled
                        </p>

                        <p className="text-4xl font-bold text-orange-500 mt-2">
                            {
                                interviews.filter(
                                    (interview) =>
                                        interview.status?.toUpperCase() ===
                                        "SCHEDULED"
                                ).length
                            }
                        </p>

                    </div>

                    {/* COMPLETED */}

                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Completed
                        </p>

                        <p className="text-4xl font-bold text-green-600 mt-2">
                            {
                                interviews.filter(
                                    (interview) =>
                                        interview.status?.toUpperCase() ===
                                        "COMPLETED"
                                ).length
                            }
                        </p>

                    </div>

                    {/* CANCELLED */}

                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Cancelled
                        </p>

                        <p className="text-4xl font-bold text-red-600 mt-2">
                            {
                                interviews.filter(
                                    (interview) =>
                                        interview.status?.toUpperCase() ===
                                        "CANCELLED"
                                ).length
                            }
                        </p>

                    </div>

                </div>

                {/* ==================================
                    NO INTERVIEWS
                ================================== */}

                {interviews.length === 0 ? (

                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">

                        <div className="text-6xl mb-5">
                            📅
                        </div>

                        <h2 className="text-3xl font-bold text-gray-700">
                            No Interviews Scheduled
                        </h2>

                        <p className="text-gray-500 mt-3">
                            You don't have any interviews scheduled yet.
                        </p>

                        <button
                            type="button"
                            onClick={loadInterviews}
                            className="
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
                            Refresh Interviews
                        </button>

                    </div>

                ) : (

                    /* ==================================
                       INTERVIEW LIST
                    ================================== */

                    <div className="grid md:grid-cols-2 gap-6">

                        {interviews.map((interview) => {

                            const application =
                                interview.application;

                            const job =
                                application?.job;

                            return (

                                <div
                                    key={interview.id}
                                    className="
                                        bg-white
                                        rounded-xl
                                        shadow-lg
                                        p-6
                                        hover:shadow-xl
                                        transition
                                    "
                                >

                                    {/* ==================================
                                        JOB TITLE
                                    ================================== */}

                                    <h2 className="text-2xl font-bold text-blue-600">
                                        {
                                            job?.title ||
                                            "Job Title Not Available"
                                        }
                                    </h2>

                                    {/* ==================================
                                        COMPANY
                                    ================================== */}

                                    <p className="text-lg font-semibold mt-2">
                                        🏢{" "}
                                        {
                                            job?.companyName ||
                                            job?.company ||
                                            "Company Not Available"
                                        }
                                    </p>

                                    {/* ==================================
                                        JOB LOCATION
                                    ================================== */}

                                    {job?.location && (
                                        <p className="text-gray-500 mt-1">
                                            📍 {job.location}
                                        </p>
                                    )}

                                    <hr className="my-5" />

                                    {/* ==================================
                                        INTERVIEW DETAILS
                                    ================================== */}

                                    <div className="space-y-3">

                                        {/* DATE */}

                                        <p>
                                            <strong>
                                                📅 Date:
                                            </strong>{" "}
                                            {
                                                formatDate(
                                                    interview.interviewDate
                                                )
                                            }
                                        </p>

                                        {/* TIME */}

                                        <p>
                                            <strong>
                                                🕐 Time:
                                            </strong>{" "}
                                            {
                                                interview.interviewTime ||
                                                "Not Available"
                                            }
                                        </p>

                                        {/* MODE */}

                                        <p>
                                            <strong>
                                                💻 Mode:
                                            </strong>{" "}
                                            {
                                                interview.interviewMode ||
                                                "Not Available"
                                            }
                                        </p>

                                        {/* INTERVIEWER */}

                                        <p>
                                            <strong>
                                                👤 Interviewer:
                                            </strong>{" "}
                                            {
                                                interview.interviewerName ||
                                                "Not Assigned"
                                            }
                                        </p>

                                        {/* EMAIL */}

                                        {interview.interviewerEmail && (
                                            <p>
                                                <strong>
                                                    ✉️ Interviewer Email:
                                                </strong>{" "}
                                                {
                                                    interview.interviewerEmail
                                                }
                                            </p>
                                        )}

                                    </div>

                                    {/* ==================================
                                        ONLINE INTERVIEW
                                    ================================== */}

                                    {interview.interviewMode?.toUpperCase() ===
                                        "ONLINE" && (

                                        <div className="mt-5">

                                            {interview.meetingLink ? (

                                                <a
                                                    href={interview.meetingLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="
                                                        inline-block
                                                        bg-blue-600
                                                        hover:bg-blue-700
                                                        text-white
                                                        px-5
                                                        py-2
                                                        rounded-lg
                                                        font-semibold
                                                    "
                                                >
                                                    🎥 Join Interview
                                                </a>

                                            ) : (

                                                <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg">
                                                    Meeting link not available yet.
                                                </div>

                                            )}

                                        </div>

                                    )}

                                    {/* ==================================
                                        OFFLINE INTERVIEW
                                    ================================== */}

                                    {interview.interviewMode?.toUpperCase() ===
                                        "OFFLINE" && (

                                        <div className="mt-5 bg-gray-50 p-4 rounded-lg">

                                            <p className="font-semibold">
                                                📍 Interview Location
                                            </p>

                                            <p className="text-gray-600 mt-1">
                                                {
                                                    interview.location ||
                                                    "Location not available"
                                                }
                                            </p>

                                        </div>

                                    )}

                                    {/* ==================================
                                        NOTES
                                    ================================== */}

                                    {interview.notes && (

                                        <div className="mt-5 bg-gray-50 p-4 rounded-lg">

                                            <p className="font-semibold">
                                                📝 Interview Notes
                                            </p>

                                            <p className="text-gray-600 mt-2 whitespace-pre-line">
                                                {interview.notes}
                                            </p>

                                        </div>

                                    )}

                                    {/* ==================================
                                        STATUS
                                    ================================== */}

                                    <div className="mt-6">

                                        <span
                                            className={
                                                "inline-block px-4 py-2 rounded-full font-semibold " +
                                                getStatusColor(
                                                    interview.status
                                                )
                                            }
                                        >
                                            {
                                                interview.status ||
                                                "UNKNOWN"
                                            }
                                        </span>

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                )}

            </div>

        </div>
    );
}

export default MyInterviews;