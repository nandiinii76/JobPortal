import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function MyApplications() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    // =====================================================
    // GET CURRENT USER
    // =====================================================

    const getUserId = () => {
        return localStorage.getItem("userId");
    };

    const getToken = () => {
        return localStorage.getItem("token");
    };

    // =====================================================
    // FETCH APPLICATIONS
    // =====================================================

    const fetchApplications = async (showRefreshState = false) => {

        const userId = getUserId();
        const token = getToken();

        if (!token || !userId) {

            setError("Please login first.");
            setApplications([]);
            setLoading(false);

            return;
        }

        try {

            if (showRefreshState) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await API.get(
                `/applications/user/${userId}`
            );

            console.log(
                "MY APPLICATIONS:",
                response.data
            );

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            setApplications(data);

        } catch (err) {

            console.error(
                "APPLICATION FETCH ERROR:",
                err
            );

            if (err.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("role");

                window.dispatchEvent(
                    new Event("authChanged")
                );

            } else if (err.response?.status === 403) {

                setError(
                    "You are not authorized to view applications."
                );

            } else {

                setError(
                    "Failed to fetch applications."
                );

            }

        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    };

    // =====================================================
    // LOAD APPLICATIONS
    // =====================================================

    useEffect(() => {

        fetchApplications();

    }, []);

    // =====================================================
    // WITHDRAW APPLICATION
    // =====================================================

    const withdrawApplication = async (applicationId) => {

        if (!applicationId) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to withdraw this application?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingId(applicationId);

            await API.delete(
                `/applications/${applicationId}`
            );

            setApplications((previousApplications) =>
                previousApplications.filter(
                    (application) =>
                        application.id !== applicationId
                )
            );

            alert(
                "Application withdrawn successfully."
            );

        } catch (err) {

            console.error(
                "WITHDRAW APPLICATION ERROR:",
                err
            );

            if (err.response?.status === 404) {

                alert(
                    "Application was not found."
                );

            } else if (err.response?.status === 401) {

                alert(
                    "Your session has expired. Please login again."
                );

                navigate("/login");

            } else {

                const message =
                    typeof err.response?.data === "string"
                        ? err.response.data
                        : err.response?.data?.message;

                alert(
                    message ||
                    "Failed to withdraw application."
                );

            }

        } finally {

            setDeletingId(null);

        }

    };

    // =====================================================
    // STATUS COLOR
    // =====================================================

    const getStatusColor = (status) => {

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
    // FORMAT SALARY
    // =====================================================

    const formatSalary = (salary) => {

        if (
            salary === null ||
            salary === undefined ||
            salary === ""
        ) {
            return "Salary not specified";
        }

        const numericSalary = Number(salary);

        if (Number.isNaN(numericSalary)) {
            return `₹ ${salary}`;
        }

        return `₹ ${numericSalary.toLocaleString("en-IN")}`;

    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "Not available";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not available";
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

            <div className="min-h-screen bg-gray-100 flex items-center justify-center">

                <div className="bg-white shadow-lg rounded-xl p-10 text-center">

                    <div className="text-4xl mb-4">
                        ⏳
                    </div>

                    <h2 className="text-2xl font-bold">
                        Loading Applications...
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Please wait.
                    </p>

                </div>

            </div>

        );

    }

    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="min-h-screen bg-gray-100 py-10 px-6">

            <div className="max-w-7xl mx-auto">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">

                    <div>

                        <h1 className="text-4xl font-bold text-gray-800">
                            My Applications
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Track all the jobs you have applied for.
                        </p>

                    </div>

                    <div className="flex gap-3">

                        <Link
                            to="/jobs"
                            className="
                                bg-green-600
                                hover:bg-green-700
                                text-white
                                px-5
                                py-2
                                rounded-lg
                                font-semibold
                                transition
                            "
                        >
                            Browse Jobs
                        </Link>

                        <button
                            onClick={() =>
                                fetchApplications(true)
                            }
                            disabled={refreshing}
                            className={`
                                ${
                                    refreshing
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700"
                                }
                                text-white
                                px-5
                                py-2
                                rounded-lg
                                font-semibold
                                transition
                            `}
                        >
                            {refreshing
                                ? "Refreshing..."
                                : "🔄 Refresh"}
                        </button>

                    </div>

                </div>

                {/* =================================================
                    SUMMARY
                ================================================= */}

                {!error && applications.length > 0 && (

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

                        <div className="bg-white rounded-xl shadow p-5">

                            <p className="text-gray-500">
                                Total Applications
                            </p>

                            <p className="text-3xl font-bold text-blue-600 mt-2">
                                {applications.length}
                            </p>

                        </div>

                        <div className="bg-white rounded-xl shadow p-5">

                            <p className="text-gray-500">
                                Applied
                            </p>

                            <p className="text-3xl font-bold text-blue-600 mt-2">

                                {
                                    applications.filter(
                                        (application) =>
                                            application.status
                                                ?.toUpperCase() ===
                                            "APPLIED"
                                    ).length
                                }

                            </p>

                        </div>

                        <div className="bg-white rounded-xl shadow p-5">

                            <p className="text-gray-500">
                                Shortlisted
                            </p>

                            <p className="text-3xl font-bold text-yellow-600 mt-2">

                                {
                                    applications.filter(
                                        (application) =>
                                            application.status
                                                ?.toUpperCase() ===
                                            "SHORTLISTED"
                                    ).length
                                }

                            </p>

                        </div>

                        <div className="bg-white rounded-xl shadow p-5">

                            <p className="text-gray-500">
                                Hired
                            </p>

                            <p className="text-3xl font-bold text-green-600 mt-2">

                                {
                                    applications.filter(
                                        (application) =>
                                            application.status
                                                ?.toUpperCase() ===
                                            "HIRED"
                                    ).length
                                }

                            </p>

                        </div>

                    </div>

                )}

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-5 mb-8">

                        <p className="font-semibold">
                            {error}
                        </p>

                        {error.includes("session") && (

                            <button
                                onClick={() =>
                                    navigate("/login")
                                }
                                className="
                                    mt-4
                                    bg-red-600
                                    hover:bg-red-700
                                    text-white
                                    px-5
                                    py-2
                                    rounded-lg
                                    font-semibold
                                "
                            >
                                Login Again
                            </button>

                        )}

                    </div>

                )}

                {/* =================================================
                    EMPTY
                ================================================= */}

                {!error && applications.length === 0 && (

                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">

                        <div className="text-6xl mb-5">
                            📄
                        </div>

                        <h2 className="text-3xl font-bold text-gray-700">
                            No Applications Yet
                        </h2>

                        <p className="text-gray-500 mt-3">
                            Start applying for jobs to see your
                            applications here.
                        </p>

                        <Link
                            to="/jobs"
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
                            Browse Jobs
                        </Link>

                    </div>

                )}

                {/* =================================================
                    APPLICATION CARDS
                ================================================= */}

                {!error && applications.length > 0 && (

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                        {applications.map((app) => {

                            const job = app.job || {};

                            const status =
                                app.status?.toUpperCase() ||
                                "UNKNOWN";

                            return (

                                <div
                                    key={app.id}
                                    className="
                                        bg-white
                                        rounded-xl
                                        shadow-lg
                                        p-6
                                        hover:shadow-xl
                                        transition
                                    "
                                >

                                    {/* JOB TITLE */}

                                    <h2 className="text-2xl font-bold text-blue-600">

                                        {job.title ||
                                            "Job title unavailable"}

                                    </h2>

                                    {/* COMPANY */}

                                    <p className="font-semibold text-gray-800 mt-2">

                                        🏢{" "}
                                        {job.company ||
                                            "Company not specified"}

                                    </p>

                                    {/* LOCATION */}

                                    <p className="text-gray-500 mt-1">

                                        📍{" "}
                                        {job.location ||
                                            "Location not specified"}

                                    </p>

                                    {/* SALARY */}

                                    <p className="mt-4 font-bold text-green-700">

                                        {formatSalary(
                                            job.salary
                                        )}

                                    </p>

                                    {/* DESCRIPTION */}

                                    <p className="text-gray-600 mt-4 line-clamp-3">

                                        {job.description ||
                                            "No job description available."}

                                    </p>

                                    {/* APPLICATION DATE */}

                                    <div className="mt-4 text-sm text-gray-500">

                                        <p>
                                            Applied On:{" "}
                                            <strong>
                                                {formatDate(
                                                    app.createdAt
                                                )}
                                            </strong>
                                        </p>

                                        {app.updatedAt && (

                                            <p className="mt-1">
                                                Last Updated:{" "}
                                                <strong>
                                                    {formatDate(
                                                        app.updatedAt
                                                    )}
                                                </strong>
                                            </p>

                                        )}

                                    </div>

                                    {/* STATUS */}

                                    <div className="mt-5">

                                        <span
                                            className={`
                                                inline-flex
                                                items-center
                                                gap-2
                                                px-4
                                                py-2
                                                rounded-full
                                                font-semibold
                                                ${getStatusColor(status)}
                                            `}
                                        >

                                            <span>
                                                {getStatusIcon(status)}
                                            </span>

                                            {status}

                                        </span>

                                    </div>

                                    {/* ACTIONS */}

                                    <div className="mt-6 flex flex-col gap-3">

                                        {job.id && (

                                            <Link
                                                to={`/jobs/${job.id}`}
                                                className="
                                                    w-full
                                                    text-center
                                                    bg-blue-600
                                                    hover:bg-blue-700
                                                    text-white
                                                    px-4
                                                    py-2
                                                    rounded-lg
                                                    font-semibold
                                                "
                                            >
                                                View Job
                                            </Link>

                                        )}

                                        {/* WITHDRAW */}

                                        {status === "APPLIED" && (

                                            <button
                                                onClick={() =>
                                                    withdrawApplication(
                                                        app.id
                                                    )
                                                }
                                                disabled={
                                                    deletingId ===
                                                    app.id
                                                }
                                                className={`
                                                    w-full
                                                    px-4
                                                    py-2
                                                    rounded-lg
                                                    font-semibold
                                                    transition
                                                    ${
                                                        deletingId ===
                                                        app.id
                                                            ? "bg-gray-400 cursor-not-allowed text-white"
                                                            : "bg-red-100 hover:bg-red-200 text-red-700"
                                                    }
                                                `}
                                            >

                                                {deletingId === app.id
                                                    ? "Withdrawing..."
                                                    : "Withdraw Application"}

                                            </button>

                                        )}

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

export default MyApplications;