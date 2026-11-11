import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ManageApplications() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // =====================================================
    // NORMALIZE ROLE
    // =====================================================

    const normalizeRole = (value) => {

        if (!value) {
            return "";
        }

        const normalized =
            String(value)
                .trim()
                .toUpperCase();

        if (
            normalized === "EMPLOYER" ||
            normalized === "ROLE_EMPLOYER"
        ) {
            return "ROLE_EMPLOYER";
        }

        if (
            normalized === "RECRUITER" ||
            normalized === "ROLE_RECRUITER"
        ) {
            return "ROLE_RECRUITER";
        }

        return normalized.startsWith("ROLE_")
            ? normalized
            : `ROLE_${normalized}`;
    };

    // =====================================================
    // ERROR MESSAGE
    // =====================================================

    const getErrorMessage = (err, fallback) => {

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

        navigate("/login", {
            replace: true
        });
    };

    // =====================================================
    // LOAD APPLICATIONS
    // =====================================================

    useEffect(() => {

        if (!token) {

            navigate("/login", {
                replace: true
            });

            return;
        }

        const normalizedRole =
            normalizeRole(role);

        const isEmployer =
            normalizedRole === "ROLE_EMPLOYER";

        const isRecruiter =
            normalizedRole === "ROLE_RECRUITER";

        if (!isEmployer && !isRecruiter) {

            navigate("/dashboard", {
                replace: true
            });

            return;
        }

        loadApplications();

    }, []);

    // =====================================================
    // FETCH EMPLOYER APPLICATIONS
    // =====================================================

    const loadApplications = async () => {

        try {

            setLoading(true);
            setError("");

            /*
             * SECURED ENDPOINT
             *
             * GET /applications/employer
             *
             * The backend identifies the employer/recruiter
             * from the JWT.
             *
             * No userId is sent.
             */

            const response =
                await API.get(
                    "/applications/employer"
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

            if (
                err.response?.status === 401
            ) {

                logout();

                return;
            }

            if (
                err.response?.status === 403
            ) {

                setError(
                    "You are not authorized to view these applications."
                );

                return;
            }

            setError(
                getErrorMessage(
                    err,
                    "Failed to load applications."
                )
            );

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // UPDATE APPLICATION STATUS
    // =====================================================

    const updateStatus = async (
        applicationId,
        status
    ) => {

        if (!applicationId || !status) {
            return;
        }

        try {

            setUpdating(applicationId);
            setError("");

            /*
             * SECURED ENDPOINT
             *
             * PUT /applications/{id}/status?status=...
             *
             * The backend verifies that this application
             * belongs to the authenticated employer/recruiter.
             */

            await API.put(
                `/applications/${applicationId}/status`,
                null,
                {
                    params: {
                        status: status
                    }
                }
            );

            setApplications(
                (previousApplications) =>
                    previousApplications.map(
                        (application) =>
                            application.id ===
                            applicationId
                                ? {
                                    ...application,
                                    status: status
                                }
                                : application
                    )
            );

        } catch (err) {

            console.error(
                "Failed to update application:",
                err
            );

            if (
                err.response?.status === 401
            ) {

                logout();

                return;
            }

            if (
                err.response?.status === 403
            ) {

                setError(
                    "You are not authorized to update this application."
                );

                return;
            }

            setError(
                getErrorMessage(
                    err,
                    "Failed to update application status."
                )
            );

        } finally {

            setUpdating(null);
        }
    };

    // =====================================================
    // FORMAT STATUS
    // =====================================================

    const formatStatus = (status) => {

        if (!status) {
            return "Unknown";
        }

        return String(status)
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(
                /\b\w/g,
                (char) => char.toUpperCase()
            );
    };

    // =====================================================
    // STATUS STYLE
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
    // GET CANDIDATE NAME
    // =====================================================

    const getCandidateName = (application) => {

        return (
            application.userName ??
            application.name ??
            application.user?.name ??
            "Candidate"
        );
    };

    // =====================================================
    // GET CANDIDATE EMAIL
    // =====================================================

    const getCandidateEmail = (application) => {

        return (
            application.userEmail ??
            application.email ??
            application.user?.email ??
            "N/A"
        );
    };

    // =====================================================
    // GET CONTACT
    // =====================================================

    const getContactNumber = (application) => {

        return (
            application.contactNumber ??
            application.user?.contactNumber ??
            null
        );
    };

    // =====================================================
    // GET JOB TITLE
    // =====================================================

    const getJobTitle = (application) => {

        return (
            application.jobTitle ??
            application.job?.title ??
            "Job"
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
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-gray-100 flex items-center justify-center">

                <div className="text-center">

                    <div className="text-4xl mb-4">
                        ⏳
                    </div>

                    <p className="text-xl text-gray-600">
                        Loading applications...
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

            <div className="max-w-7xl mx-auto px-4">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="flex flex-wrap justify-between items-center mb-8">

                    <div>

                        <h1 className="text-4xl font-bold text-gray-800">
                            Manage Applications
                        </h1>

                        <p className="text-gray-600 mt-2">
                            Review candidates and update application status.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/employer-dashboard")
                        }
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
                    >
                        Dashboard
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
                    EMPTY
                ================================================= */}

                {!error &&
                    applications.length === 0 && (

                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">

                            <div className="text-6xl mb-5">
                                📄
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800">
                                No Applications
                            </h2>

                            <p className="text-gray-600 mt-3">
                                No candidates have applied to your jobs yet.
                            </p>

                        </div>
                    )}

                {/* =================================================
                    APPLICATIONS
                ================================================= */}

                {!error &&
                    applications.length > 0 && (

                        <div className="space-y-6">

                            {applications.map(
                                (application) => (

                                    <div
                                        key={application.id}
                                        className="bg-white rounded-xl shadow-lg p-6"
                                    >

                                        <div className="grid md:grid-cols-2 gap-6">

                                            {/* =================================================
                                                CANDIDATE
                                            ================================================= */}

                                            <div>

                                                <h2 className="text-2xl font-bold text-blue-600">

                                                    {getCandidateName(
                                                        application
                                                    )}

                                                </h2>

                                                <p className="mt-2 text-gray-700">

                                                    <strong>
                                                        Email:
                                                    </strong>{" "}

                                                    {getCandidateEmail(
                                                        application
                                                    )}

                                                </p>

                                                {getContactNumber(
                                                    application
                                                ) && (

                                                    <p className="mt-2 text-gray-700">

                                                        <strong>
                                                            Contact:
                                                        </strong>{" "}

                                                        {getContactNumber(
                                                            application
                                                        )}

                                                    </p>
                                                )}

                                            </div>

                                            {/* =================================================
                                                JOB
                                            ================================================= */}

                                            <div>

                                                <h3 className="text-xl font-semibold text-gray-800">

                                                    {getJobTitle(
                                                        application
                                                    )}

                                                </h3>

                                                <p className="mt-2 text-gray-700">

                                                    <strong>
                                                        Company:
                                                    </strong>{" "}

                                                    {getCompany(
                                                        application
                                                    )}

                                                </p>

                                                <p className="mt-2 text-gray-500">

                                                    Applied on{" "}

                                                    {formatDate(
                                                        application.createdAt
                                                    )}

                                                </p>

                                            </div>

                                        </div>

                                        {/* =================================================
                                            STATUS
                                        ================================================= */}

                                        <div className="mt-6">

                                            <span
                                                className={`inline-block px-4 py-2 rounded-full font-semibold ${getStatusClass(
                                                    application.status
                                                )}`}
                                            >

                                                {formatStatus(
                                                    application.status
                                                )}

                                            </span>

                                        </div>

                                        {/* =================================================
                                            STATUS ACTIONS
                                        ================================================= */}

                                        <div className="flex flex-wrap gap-3 mt-6">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateStatus(
                                                        application.id,
                                                        "SHORTLISTED"
                                                    )
                                                }
                                                disabled={
                                                    updating ===
                                                    application.id
                                                }
                                                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                                            >
                                                Shortlist
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateStatus(
                                                        application.id,
                                                        "INTERVIEW"
                                                    )
                                                }
                                                disabled={
                                                    updating ===
                                                    application.id
                                                }
                                                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                                            >
                                                Interview
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateStatus(
                                                        application.id,
                                                        "HIRED"
                                                    )
                                                }
                                                disabled={
                                                    updating ===
                                                    application.id
                                                }
                                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                                            >
                                                Hire
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateStatus(
                                                        application.id,
                                                        "REJECTED"
                                                    )
                                                }
                                                disabled={
                                                    updating ===
                                                    application.id
                                                }
                                                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                                            >
                                                Reject
                                            </button>

                                        </div>

                                        {/* =================================================
                                            VIEW DETAILS
                                        ================================================= */}

                                        <div className="mt-6">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/applications/${application.id}`
                                                    )
                                                }
                                                className="text-blue-600 hover:text-blue-800 underline"
                                            >
                                                View Application Details
                                            </button>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>
                    )}

            </div>

        </div>
    );
}

export default ManageApplications;