import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function ApplicationDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // LOAD APPLICATION
    // =====================================================

    useEffect(() => {

        loadApplication();

    }, [id]);

    // =====================================================
    // FETCH APPLICATION
    // =====================================================

    const loadApplication = async () => {

        try {

            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("token");

            if (!token) {

                navigate("/login", {
                    replace: true
                });

                return;
            }

            /*
             * SECURED ENDPOINT
             *
             * GET /applications/{id}
             *
             * Backend checks whether the authenticated
             * user is allowed to view this application.
             */

            const response =
                await API.get(
                    `/applications/${id}`
                );

            setApplication(
                response.data
            );

        } catch (err) {

            console.error(
                "Failed to load application:",
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
                    "You are not authorized to view this application."
                );

                return;
            }

            if (
                err.response?.status === 404
            ) {

                setError(
                    "Application not found."
                );

                return;
            }

            setError(
                getErrorMessage(
                    err,
                    "Failed to load application."
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

        navigate("/login", {
            replace: true
        });
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
    // GET JOB ID
    // =====================================================

    const getJobId = () => {

        return (
            application?.jobId ??
            application?.job?.id
        );
    };

    // =====================================================
    // GET JOB TITLE
    // =====================================================

    const getJobTitle = () => {

        return (
            application?.jobTitle ??
            application?.job?.title ??
            "Job"
        );
    };

    // =====================================================
    // GET COMPANY
    // =====================================================

    const getCompany = () => {

        return (
            application?.company ??
            application?.job?.company ??
            "N/A"
        );
    };

    // =====================================================
    // GET CANDIDATE NAME
    // =====================================================

    const getCandidateName = () => {

        return (
            application?.userName ??
            application?.name ??
            application?.user?.name ??
            "Candidate"
        );
    };

    // =====================================================
    // GET CANDIDATE EMAIL
    // =====================================================

    const getCandidateEmail = () => {

        return (
            application?.userEmail ??
            application?.email ??
            application?.user?.email ??
            "N/A"
        );
    };

    // =====================================================
    // GET CONTACT
    // =====================================================

    const getContactNumber = () => {

        return (
            application?.contactNumber ??
            application?.user?.contactNumber ??
            "N/A"
        );
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
                (char) =>
                    char.toUpperCase()
            );
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
                        Loading application...
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

                <div className="bg-white rounded-xl shadow-lg p-10 max-w-lg w-full text-center">

                    <div className="text-5xl mb-5">
                        ⚠️
                    </div>

                    <h2 className="text-2xl font-bold text-red-600">
                        Unable to Load Application
                    </h2>

                    <p className="text-gray-600 mt-4">
                        {error}
                    </p>

                    <div className="flex justify-center gap-3 mt-6">

                        <button
                            type="button"
                            onClick={loadApplication}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                        >
                            Try Again
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(-1)
                            }
                            className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg"
                        >
                            Go Back
                        </button>

                    </div>

                </div>

            </div>
        );
    }

    // =====================================================
    // APPLICATION NOT FOUND
    // =====================================================

    if (!application) {

        return (

            <div className="min-h-screen bg-gray-100 flex items-center justify-center">

                <div className="text-center">

                    <h2 className="text-3xl font-bold">
                        Application Not Found
                    </h2>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    >
                        Go Back
                    </button>

                </div>

            </div>
        );
    }

    const jobId =
        getJobId();

    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="min-h-screen bg-gray-100 py-10">

            <div className="max-w-5xl mx-auto px-4">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="flex flex-wrap justify-between items-center mb-8">

                    <div>

                        <h1 className="text-4xl font-bold text-gray-800">
                            Application Details
                        </h1>

                        <p className="text-gray-600 mt-2">
                            View application and candidate information.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
                    >
                        Back
                    </button>

                </div>

                {/* =================================================
                    APPLICATION STATUS
                ================================================= */}

                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">

                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

                        <div>

                            <p className="text-sm text-gray-500">
                                Application Status
                            </p>

                            <span
                                className={`inline-block mt-2 px-5 py-2 rounded-full font-semibold ${getStatusClass(
                                    application.status
                                )}`}
                            >
                                {formatStatus(
                                    application.status
                                )}
                            </span>

                        </div>

                        <div className="text-gray-500">

                            <p>
                                Application ID:{" "}
                                <strong>
                                    #{application.id}
                                </strong>
                            </p>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    JOB INFORMATION
                ================================================= */}

                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">

                    <h2 className="text-2xl font-bold text-blue-600 mb-6">
                        Job Information
                    </h2>

                    <div className="grid md:grid-cols-2 gap-5">

                        <div>

                            <p className="text-sm text-gray-500">
                                Job Title
                            </p>

                            <p className="text-lg font-semibold text-gray-800 mt-1">
                                {getJobTitle()}
                            </p>

                        </div>

                        <div>

                            <p className="text-sm text-gray-500">
                                Company
                            </p>

                            <p className="text-lg font-semibold text-gray-800 mt-1">
                                {getCompany()}
                            </p>

                        </div>

                        {application.job?.location && (

                            <div>

                                <p className="text-sm text-gray-500">
                                    Location
                                </p>

                                <p className="text-lg text-gray-800 mt-1">
                                    {application.job.location}
                                </p>

                            </div>
                        )}

                        {application.job?.jobType && (

                            <div>

                                <p className="text-sm text-gray-500">
                                    Job Type
                                </p>

                                <p className="text-lg text-gray-800 mt-1">
                                    {application.job.jobType}
                                </p>

                            </div>
                        )}

                        {application.job?.experienceLevel && (

                            <div>

                                <p className="text-sm text-gray-500">
                                    Experience
                                </p>

                                <p className="text-lg text-gray-800 mt-1">
                                    {application.job.experienceLevel}
                                </p>

                            </div>
                        )}

                        {application.job?.category && (

                            <div>

                                <p className="text-sm text-gray-500">
                                    Category
                                </p>

                                <p className="text-lg text-gray-800 mt-1">
                                    {application.job.category}
                                </p>

                            </div>
                        )}

                    </div>

                    {application.job?.description && (

                        <div className="mt-6">

                            <p className="text-sm text-gray-500">
                                Job Description
                            </p>

                            <p className="text-gray-700 leading-7 mt-2">
                                {application.job.description}
                            </p>

                        </div>
                    )}

                    {jobId && (

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/jobs/${jobId}`
                                )
                            }
                            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                        >
                            View Job
                        </button>
                    )}

                </div>

                {/* =================================================
                    CANDIDATE INFORMATION
                ================================================= */}

                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">

                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        Candidate Information
                    </h2>

                    <div className="grid md:grid-cols-2 gap-5">

                        <div>

                            <p className="text-sm text-gray-500">
                                Name
                            </p>

                            <p className="text-lg font-semibold text-gray-800 mt-1">
                                {getCandidateName()}
                            </p>

                        </div>

                        <div>

                            <p className="text-sm text-gray-500">
                                Email
                            </p>

                            <p className="text-lg text-gray-800 mt-1 break-all">
                                {getCandidateEmail()}
                            </p>

                        </div>

                        <div>

                            <p className="text-sm text-gray-500">
                                Contact Number
                            </p>

                            <p className="text-lg text-gray-800 mt-1">
                                {getContactNumber()}
                            </p>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    DATES
                ================================================= */}

                <div className="bg-white rounded-xl shadow-lg p-8">

                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        Application Timeline
                    </h2>

                    <div className="grid md:grid-cols-2 gap-5">

                        <div>

                            <p className="text-sm text-gray-500">
                                Applied On
                            </p>

                            <p className="text-lg text-gray-800 mt-1">
                                {formatDate(
                                    application.createdAt
                                )}
                            </p>

                        </div>

                        <div>

                            <p className="text-sm text-gray-500">
                                Last Updated
                            </p>

                            <p className="text-lg text-gray-800 mt-1">
                                {formatDate(
                                    application.updatedAt
                                )}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default ApplicationDetails;