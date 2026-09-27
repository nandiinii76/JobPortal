import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function JobDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [similarJobs, setSimilarJobs] = useState([]);

    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [saving, setSaving] = useState(false);
    const [checkingApplication, setCheckingApplication] = useState(false);

    const [alreadyApplied, setAlreadyApplied] = useState(false);

    const [role, setRole] = useState(
        localStorage.getItem("role")
    );

    const [userId, setUserId] = useState(
        localStorage.getItem("userId")
    );

    // =====================================================
    // LOAD JOB
    // =====================================================

    useEffect(() => {
        loadJob();
    }, [id]);

    // =====================================================
    // LOAD AUTH STATE
    // =====================================================

    useEffect(() => {

        const refreshAuth = () => {

            setRole(localStorage.getItem("role"));
            setUserId(localStorage.getItem("userId"));

        };

        window.addEventListener(
            "storage",
            refreshAuth
        );

        window.addEventListener(
            "authChanged",
            refreshAuth
        );

        return () => {

            window.removeEventListener(
                "storage",
                refreshAuth
            );

            window.removeEventListener(
                "authChanged",
                refreshAuth
            );

        };

    }, []);

    // =====================================================
    // LOAD JOB
    // =====================================================

    const loadJob = async () => {

        try {

            setLoading(true);

            const jobRes = await API.get(
                `/jobs/${id}`
            );

            setJob(jobRes.data);

            // =================================================
            // LOAD SIMILAR JOBS
            // =================================================

            try {

                const similarRes = await API.get(
                    `/jobs/${id}/similar`
                );

                setSimilarJobs(
                    Array.isArray(similarRes.data)
                        ? similarRes.data
                        : []
                );

            } catch (similarError) {

                console.log(
                    "Similar jobs unavailable:",
                    similarError
                );

                setSimilarJobs([]);

            }

        } catch (err) {

            console.error(
                "Load job error:",
                err
            );

            alert(
                "Failed to load job."
            );

            setJob(null);

        } finally {

            setLoading(false);

        }

    };

    // =====================================================
    // CHECK WHETHER CANDIDATE ALREADY APPLIED
    // =====================================================

    useEffect(() => {

        if (
            job?.id &&
            userId &&
            (
                role === "ROLE_JOB_SEEKER" ||
                role === "ROLE_USER" ||
                role === "CANDIDATE" ||
                role === "JOB_SEEKER"
            )
        ) {

            checkApplication();

        }

    }, [job, userId, role]);

    // =====================================================
    // CHECK APPLICATION
    // =====================================================

    const checkApplication = async () => {

        try {

            setCheckingApplication(true);

            const response = await API.get(
                `/applications/user/${userId}`
            );

            const applications =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            const exists =
                applications.some(
                    (application) =>
                        String(application.job?.id) ===
                        String(job.id)
                );

            setAlreadyApplied(exists);

        } catch (err) {

            console.error(
                "Check application error:",
                err
            );

            // Don't prevent the candidate from applying
            // if the status check itself fails.

            setAlreadyApplied(false);

        } finally {

            setCheckingApplication(false);

        }

    };

    // =====================================================
    // APPLY FOR JOB
    // =====================================================

    const applyJob = async () => {

        // =================================================
        // CHECK LOGIN
        // =================================================

        if (!userId) {

            alert(
                "Please login before applying for a job."
            );

            navigate("/login");

            return;

        }

        // =================================================
        // CHECK JOB
        // =================================================

        if (!job?.id) {

            alert(
                "Job information is not available."
            );

            return;

        }

        // =================================================
        // CHECK ROLE
        // =================================================

        const normalizedRole =
            role?.trim().toUpperCase();

        const isJobSeeker =
            normalizedRole === "ROLE_JOB_SEEKER" ||
            normalizedRole === "ROLE_USER" ||
            normalizedRole === "CANDIDATE" ||
            normalizedRole === "JOB_SEEKER";

        if (!isJobSeeker) {

            alert(
                "Only job seekers can apply for jobs."
            );

            return;

        }

        // =================================================
        // DUPLICATE CHECK
        // =================================================

        if (alreadyApplied) {

            alert(
                "You have already applied for this job."
            );

            return;

        }

        try {

            setApplying(true);

            /*
             * Backend endpoint:
             *
             * POST /applications/apply/{userId}/{jobId}
             */

            const response = await API.post(
                `/applications/apply/${userId}/${job.id}`
            );

            console.log(
                "Application response:",
                response.data
            );

            setAlreadyApplied(true);

            alert(
                "Application submitted successfully!"
            );

        } catch (err) {

            console.error(
                "Application error:",
                err
            );

            if (err.response) {

                const message =
                    typeof err.response.data === "string"
                        ? err.response.data
                        : err.response.data?.message;

                alert(
                    message ||
                    `Failed to apply. Server returned ${err.response.status}.`
                );

            } else {

                alert(
                    "Cannot connect to backend server."
                );

            }

        } finally {

            setApplying(false);

        }

    };

    // =====================================================
    // SAVE JOB
    // =====================================================

    const saveJob = async () => {

        if (!userId) {

            alert(
                "Please login first."
            );

            navigate("/login");

            return;

        }

        if (!job?.id) {

            alert(
                "Job information is not available."
            );

            return;

        }

        try {

            setSaving(true);

            const response = await API.post(
                "/saved/save",
                null,
                {
                    params: {
                        userId: userId,
                        jobId: job.id
                    }
                }
            );

            console.log(
                "Save response:",
                response.data
            );

            alert(
                "Job saved successfully!"
            );

        } catch (err) {

            console.error(
                "Save job error:",
                err
            );

            if (err.response) {

                const message =
                    typeof err.response.data === "string"
                        ? err.response.data
                        : err.response.data?.message;

                alert(
                    message ||
                    `Failed to save job. Status: ${err.response.status}`
                );

            } else {

                alert(
                    "Cannot connect to backend server."
                );

            }

        } finally {

            setSaving(false);

        }

    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="min-h-screen flex justify-center items-center">

                <h2 className="text-3xl font-bold">
                    Loading...
                </h2>

            </div>

        );

    }

    // =====================================================
    // JOB NOT FOUND
    // =====================================================

    if (!job) {

        return (

            <div className="min-h-screen flex justify-center items-center">

                <div className="text-center">

                    <h2 className="text-3xl font-bold">
                        Job Not Found
                    </h2>

                    <button
                        onClick={() => navigate("/jobs")}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    >
                        Browse Jobs
                    </button>

                </div>

            </div>

        );

    }

    // =====================================================
    // ROLE CHECK
    // =====================================================

    const normalizedRole =
        role?.trim().toUpperCase();

    const isJobSeeker =
        normalizedRole === "ROLE_JOB_SEEKER" ||
        normalizedRole === "ROLE_USER" ||
        normalizedRole === "CANDIDATE" ||
        normalizedRole === "JOB_SEEKER";

    return (

        <div className="min-h-screen bg-gray-100 py-10">

            <div className="max-w-5xl mx-auto px-4">

                {/* =================================================
                    JOB DETAILS
                ================================================= */}

                <div className="bg-white rounded-xl shadow-lg p-10">

                    <h1 className="text-4xl font-bold text-blue-600 mb-6">
                        {job.title}
                    </h1>

                    <div className="space-y-4 text-lg">

                        {/* COMPANY */}

                        <div>

                            <p>
                                <strong>
                                    Company:
                                </strong>{" "}
                                {job.company || "N/A"}
                            </p>

                            {job.employer && (

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/company/${job.employer.id}`
                                        )
                                    }
                                    className="mt-2 text-blue-600 hover:text-blue-800 underline font-semibold"
                                >
                                    View Company Profile
                                </button>

                            )}

                        </div>

                        {/* LOCATION */}

                        <p>

                            <strong>
                                Location:
                            </strong>{" "}

                            {job.location || "N/A"}

                        </p>

                        {/* SALARY */}

                        <p>

                            <strong>
                                Salary:
                            </strong>{" "}

                            {job.salary != null
                                ? `₹${job.salary}`
                                : "Not specified"}

                        </p>

                        {/* DESCRIPTION */}

                        <div>

                            <p>
                                <strong>
                                    Description:
                                </strong>
                            </p>

                            <p className="text-gray-700 leading-7 mt-2">

                                {job.description ||
                                    "No description provided."}

                            </p>

                        </div>

                    </div>

                    {/* =================================================
                        ACTION BUTTONS
                    ================================================= */}

                    <div className="flex flex-wrap gap-4 mt-10">

                        {isJobSeeker && (

                            <>

                                {/* APPLY */}

                                {alreadyApplied ? (

                                    <button
                                        disabled
                                        className="bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed"
                                    >
                                        ✓ Already Applied
                                    </button>

                                ) : (

                                    <button
                                        onClick={applyJob}
                                        disabled={
                                            applying ||
                                            checkingApplication
                                        }
                                        className={`${
                                            applying ||
                                            checkingApplication
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-green-600 hover:bg-green-700"
                                        } text-white px-6 py-3 rounded-lg`}
                                    >

                                        {checkingApplication
                                            ? "Checking..."
                                            : applying
                                                ? "Applying..."
                                                : "Apply Now"}

                                    </button>

                                )}

                                {/* SAVE */}

                                <button
                                    onClick={saveJob}
                                    disabled={saving}
                                    className={`${
                                        saving
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    } text-white px-6 py-3 rounded-lg`}
                                >

                                    {saving
                                        ? "Saving..."
                                        : "Save Job"}

                                </button>

                                {/* MY APPLICATIONS */}

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/my-applications"
                                        )
                                    }
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
                                >
                                    My Applications
                                </button>

                            </>

                        )}

                        {/* BACK */}

                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
                        >
                            Back
                        </button>

                    </div>

                </div>

                {/* =================================================
                    SIMILAR JOBS
                ================================================= */}

                <div className="mt-10">

                    <h2 className="text-3xl font-bold mb-6">
                        Similar Jobs
                    </h2>

                    {similarJobs.length === 0 ? (

                        <div className="bg-white rounded-xl shadow p-6 text-center">

                            No Similar Jobs Found

                        </div>

                    ) : (

                        <div className="grid md:grid-cols-2 gap-6">

                            {similarJobs.map((item) => (

                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                                >

                                    <h3 className="text-2xl font-bold text-blue-600">
                                        {item.title}
                                    </h3>

                                    <div className="mt-2">

                                        <p>

                                            <strong>
                                                Company:
                                            </strong>{" "}

                                            {item.company || "N/A"}

                                        </p>

                                        {item.employer && (

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/company/${item.employer.id}`
                                                    )
                                                }
                                                className="text-blue-600 hover:text-blue-800 underline mt-1"
                                            >
                                                View Company
                                            </button>

                                        )}

                                    </div>

                                    <p className="mt-2">

                                        <strong>
                                            Location:
                                        </strong>{" "}

                                        {item.location || "N/A"}

                                    </p>

                                    <p className="mt-2">

                                        <strong>
                                            Salary:
                                        </strong>{" "}

                                        {item.salary != null
                                            ? `₹${item.salary}`
                                            : "Not specified"}

                                    </p>

                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/jobs/${item.id}`
                                            )
                                        }
                                        className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                                    >
                                        View Details
                                    </button>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}

export default JobDetails;