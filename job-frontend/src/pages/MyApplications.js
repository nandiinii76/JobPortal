import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function MyApplications() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // LOAD APPLICATIONS
    // =====================================================

    useEffect(() => {

        loadApplications();

    }, []);

    // =====================================================
    // FETCH MY APPLICATIONS
    // =====================================================

    const loadApplications = async () => {

        try {

            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("token");

            if (!token) {

                navigate("/login");

                return;
            }

            /*
             * SECURED ENDPOINT
             *
             * GET /applications/my
             *
             * The backend identifies the user
             * from the JWT.
             *
             * Do NOT send userId.
             */

            const response =
                await API.get(
                    "/applications/my"
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

            // ---------------------------------------------
            // UNAUTHORIZED
            // ---------------------------------------------

            if (
                err.response?.status === 401
            ) {

                logout();

                return;
            }

            // ---------------------------------------------
            // FORBIDDEN
            // ---------------------------------------------

            if (
                err.response?.status === 403
            ) {

                setError(
                    "You are not authorized to view your applications."
                );

                return;
            }

            // ---------------------------------------------
            // OTHER ERROR
            // ---------------------------------------------

            setError(
                getErrorMessage(
                    err,
                    "Failed to load your applications."
                )
            );

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        window.dispatchEvent(
            new Event("authChanged")
        );

        navigate("/login");
    };

    // =====================================================
    // ERROR MESSAGE
    // =====================================================

    const getErrorMessage = (
        err,
        fallback
    ) => {

        const data =
            err?.response?.data;

        if (
            typeof data === "string" &&
            data.trim()
        ) {

            return data;
        }

        if (data?.message) {

            return data.message;
        }

        if (data?.error) {

            return data.error;
        }

        return fallback;
    };

    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {

        switch (
            status?.toUpperCase()
        ) {

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
    // FORMAT DATE
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
    // GET JOB ID
    // =====================================================

    const getJobId = (application) => {

        return (
            application.jobId ??
            application.job?.id
        );
    };

    // =====================================================
    // GET JOB TITLE
    // =====================================================

    const getJobTitle = (application) => {

        return (
            application.jobTitle ??
            application.job?.title ??
            "Job Title Not Available"
        );
    };

    // =====================================================
    // GET COMPANY
    // =====================================================

    const getCompany = (application) => {

        return (
            application.company ??
            application.job?.company ??
            "N/A"
        );
    };

    // =====================================================
    // VIEW JOB
    // =====================================================

    const viewJob = (jobId) => {

        if (!jobId) {
            return;
        }

        navigate(
            `/jobs/${jobId}`
        );
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-gray-100 flex items-center justify-center">

                <div className="text-center">

                    <div className="text-3xl mb-4">
                        ⏳
                    </div>

                    <p className="text-lg text-gray-600">
                        Loading your applications...
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="min-h-screen bg-gray-100 py-10">

            <div className="max-w-6xl mx-auto px-4">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="flex flex-wrap justify-between items-center mb-8">

                    <div>

                        <h1 className="text-4xl font-bold text-gray-800">
                            My Applications
                        </h1>

                        <p className="text-gray-600 mt-2">
                            Track the jobs you have applied for.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/jobs")
                        }
                        className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    >
                        Browse Jobs
                    </button>

                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-5 mb-6">

                        <p className="font-semibold">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={loadApplications}
                            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                        >
                            Try Again
                        </button>

                    </div>
                )}

                {/* =================================================
                    NO APPLICATIONS
                ================================================= */}

                {!error &&
                    applications.length === 0 && (

                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">

                            <div className="text-6xl mb-5">
                                📄
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800">
                                No Applications Yet
                            </h2>

                            <p className="text-gray-600 mt-3">
                                You haven't applied for any jobs yet.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/jobs")
                                }
                                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                            >
                                Find Jobs
                            </button>

                        </div>
                    )}

                {/* =================================================
                    APPLICATION LIST
                ================================================= */}

                {!error &&
                    applications.length > 0 && (

                        <div className="space-y-6">

                            {applications.map(
                                (application) => {

                                    const jobId =
                                        getJobId(
                                            application
                                        );

                                    return (

                                        <div
                                            key={
                                                application.id
                                            }
                                            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                                        >

                                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-5">

                                                {/* =================================================
                                                    JOB INFORMATION
                                                ================================================= */}

                                                <div className="flex-1">

                                                    <h2 className="text-2xl font-bold text-blue-600">

                                                        {getJobTitle(
                                                            application
                                                        )}

                                                    </h2>

                                                    <p className="text-lg text-gray-700 mt-2">

                                                        <strong>
                                                            Company:
                                                        </strong>{" "}

                                                        {getCompany(
                                                            application
                                                        )}

                                                    </p>

                                                    <p className="text-gray-500 mt-2">

                                                        Applied on{" "}

                                                        <strong>
                                                            {formatDate(
                                                                application.createdAt
                                                            )}
                                                        </strong>

                                                    </p>

                                                    {application.updatedAt && (

                                                        <p className="text-gray-500 mt-1">

                                                            Last updated:{" "}

                                                            {formatDate(
                                                                application.updatedAt
                                                            )}

                                                        </p>
                                                    )}

                                                </div>

                                                {/* =================================================
                                                    STATUS
                                                ================================================= */}

                                                <div>

                                                    <span
                                                        className={`inline-block px-4 py-2 rounded-full font-semibold ${getStatusClass(
                                                            application.status
                                                        )}`}
                                                    >

                                                        {application.status ||
                                                            "UNKNOWN"}

                                                    </span>

                                                </div>

                                            </div>

                                            {/* =================================================
                                                ACTIONS
                                            ================================================= */}

                                            <div className="flex flex-wrap gap-3 mt-6">

                                                {jobId && (

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            viewJob(
                                                                jobId
                                                            )
                                                        }
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                                                    >
                                                        View Job
                                                    </button>

                                                )}

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

export default MyApplications;