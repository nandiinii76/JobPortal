import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function SavedJobs() {

    const navigate = useNavigate();

    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingJobId, setRemovingJobId] = useState(null);
    const [applyingJobId, setApplyingJobId] = useState(null);

    const token = localStorage.getItem("token");

    // =====================================================
    // LOAD SAVED JOBS
    // =====================================================

    useEffect(() => {

        if (!token) {

            setLoading(false);
            navigate("/login");

            return;
        }

        loadSavedJobs();

    }, [token]);

    // =====================================================
    // LOAD SAVED JOBS
    // =====================================================

    const loadSavedJobs = async () => {

        try {

            setLoading(true);

            /*
             * Secured backend endpoint:
             *
             * GET /saved-jobs
             *
             * User is identified from JWT.
             */

            const response =
                await API.get("/saved-jobs");

            setSavedJobs(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                "Load saved jobs error:",
                err
            );

            if (
                err.response?.status === 401
            ) {

                logout();

                return;
            }

            alert(
                getErrorMessage(
                    err,
                    "Failed to load saved jobs."
                )
            );

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // REMOVE SAVED JOB
    // =====================================================

    const removeJob = async (jobId) => {

        if (!jobId) {
            return;
        }

        try {

            setRemovingJobId(jobId);

            /*
             * Secured backend endpoint:
             *
             * DELETE /saved-jobs?jobId={jobId}
             *
             * User ID is NOT sent.
             */

            await API.delete(
                "/saved-jobs",
                {
                    params: {
                        jobId: jobId
                    }
                }
            );

            setSavedJobs((previous) =>
                previous.filter(
                    (item) =>
                        String(item.job?.id) !==
                        String(jobId)
                )
            );

        } catch (err) {

            console.error(
                "Remove saved job error:",
                err
            );

            if (
                err.response?.status === 401
            ) {

                logout();

                return;
            }

            alert(
                getErrorMessage(
                    err,
                    "Failed to remove saved job."
                )
            );

        } finally {

            setRemovingJobId(null);
        }
    };

    // =====================================================
    // APPLY FOR JOB
    // =====================================================

    const applyJob = async (jobId) => {

        if (!jobId) {
            return;
        }

        try {

            setApplyingJobId(jobId);

            /*
             * Secured backend endpoint:
             *
             * POST /applications/apply/{jobId}
             *
             * User ID is NOT sent.
             */

            await API.post(
                `/applications/apply/${jobId}`
            );

            alert(
                "Application submitted successfully."
            );

        } catch (err) {

            console.error(
                "Apply job error:",
                err
            );

            if (
                err.response?.status === 401
            ) {

                logout();

                return;
            }

            alert(
                getErrorMessage(
                    err,
                    "Failed to apply for this job."
                )
            );

        } finally {

            setApplyingJobId(null);
        }
    };

    // =====================================================
    // VIEW JOB
    // =====================================================

    const viewJob = (jobId) => {

        if (!jobId) {
            return;
        }

        navigate(`/jobs/${jobId}`);
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
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-gray-100 flex justify-center items-center">

                <h2 className="text-2xl font-semibold">
                    Loading Saved Jobs...
                </h2>

            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="min-h-screen bg-gray-100 py-10 px-6">

            <div className="max-w-7xl mx-auto">

                {/* PAGE HEADER */}

                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">

                    <h1 className="text-4xl font-bold">
                        Saved Jobs
                    </h1>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/jobs")
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    >
                        Browse Jobs
                    </button>

                </div>

                {/* NO SAVED JOBS */}

                {savedJobs.length === 0 ? (

                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">

                        <h2 className="text-2xl font-bold mb-3">
                            No Saved Jobs
                        </h2>

                        <p className="text-gray-500 mb-6">
                            Save jobs from the Jobs page
                            to view them here.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/jobs")
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                        >
                            Find Jobs
                        </button>

                    </div>

                ) : (

                    /* SAVED JOBS */

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {savedJobs.map((saved) => {

                            const job =
                                saved.job;

                            if (!job) {
                                return null;
                            }

                            return (

                                <div
                                    key={saved.id}
                                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300"
                                >

                                    {/* TITLE */}

                                    <h2
                                        className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-800"
                                        onClick={() =>
                                            viewJob(job.id)
                                        }
                                    >
                                        {job.title}
                                    </h2>

                                    {/* COMPANY */}

                                    <p className="mt-4">

                                        <strong>
                                            Company:
                                        </strong>{" "}

                                        {job.company ||
                                            "N/A"}

                                    </p>

                                    {/* LOCATION */}

                                    <p className="mt-2">

                                        <strong>
                                            Location:
                                        </strong>{" "}

                                        {job.location ||
                                            "N/A"}

                                    </p>

                                    {/* JOB TYPE */}

                                    {job.jobType && (

                                        <p className="mt-2">

                                            <strong>
                                                Job Type:
                                            </strong>{" "}

                                            {job.jobType}

                                        </p>
                                    )}

                                    {/* EXPERIENCE */}

                                    {job.experienceLevel && (

                                        <p className="mt-2">

                                            <strong>
                                                Experience:
                                            </strong>{" "}

                                            {job.experienceLevel}

                                        </p>
                                    )}

                                    {/* CATEGORY */}

                                    {job.category && (

                                        <p className="mt-2">

                                            <strong>
                                                Category:
                                            </strong>{" "}

                                            {job.category}

                                        </p>
                                    )}

                                    {/* SALARY */}

                                    <p className="mt-2">

                                        <strong>
                                            Salary:
                                        </strong>{" "}

                                        {job.salary != null
                                            ? `₹${job.salary}`
                                            : "Not specified"}

                                    </p>

                                    {/* DESCRIPTION */}

                                    <p className="mt-4 text-gray-600 line-clamp-4">

                                        {job.description ||
                                            "No description provided."}

                                    </p>

                                    {/* BUTTONS */}

                                    <div className="flex flex-col gap-3 mt-6">

                                        {/* VIEW */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                viewJob(job.id)
                                            }
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                                        >
                                            View Job
                                        </button>

                                        <div className="flex gap-3">

                                            {/* APPLY */}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    applyJob(
                                                        job.id
                                                    )
                                                }
                                                disabled={
                                                    applyingJobId ===
                                                    job.id
                                                }
                                                className={`flex-1 ${
                                                    applyingJobId ===
                                                    job.id
                                                        ? "bg-gray-400 cursor-not-allowed"
                                                        : "bg-green-600 hover:bg-green-700"
                                                } text-white py-2 rounded-lg`}
                                            >

                                                {applyingJobId ===
                                                job.id
                                                    ? "Applying..."
                                                    : "Apply"}

                                            </button>

                                            {/* REMOVE */}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeJob(
                                                        job.id
                                                    )
                                                }
                                                disabled={
                                                    removingJobId ===
                                                    job.id
                                                }
                                                className={`flex-1 ${
                                                    removingJobId ===
                                                    job.id
                                                        ? "bg-gray-400 cursor-not-allowed"
                                                        : "bg-red-600 hover:bg-red-700"
                                                } text-white py-2 rounded-lg`}
                                            >

                                                {removingJobId ===
                                                job.id
                                                    ? "Removing..."
                                                    : "Remove"}

                                            </button>

                                        </div>

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

export default SavedJobs;