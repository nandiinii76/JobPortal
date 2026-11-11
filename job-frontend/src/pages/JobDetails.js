import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function JobDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);

    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [saving, setSaving] = useState(false);
    const [checkingApplication, setCheckingApplication] = useState(false);
    const [checkingSaved, setCheckingSaved] = useState(false);

    const [alreadyApplied, setAlreadyApplied] = useState(false);
    const [alreadySaved, setAlreadySaved] = useState(false);

    const [role, setRole] = useState(
        localStorage.getItem("role")
    );

    const [userId, setUserId] = useState(
        localStorage.getItem("userId")
    );

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
            normalized === "USER" ||
            normalized === "ROLE_USER" ||
            normalized === "CANDIDATE" ||
            normalized === "ROLE_CANDIDATE" ||
            normalized === "JOBSEEKER" ||
            normalized === "JOB_SEEKER" ||
            normalized === "ROLE_JOBSEEKER"
        ) {
            return "ROLE_JOB_SEEKER";
        }

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

        if (
            normalized === "ADMIN" ||
            normalized === "ROLE_ADMIN"
        ) {
            return "ROLE_ADMIN";
        }

        if (
            normalized === "SUPER_ADMIN" ||
            normalized === "ROLE_SUPER_ADMIN"
        ) {
            return "ROLE_SUPER_ADMIN";
        }

        return normalized.startsWith("ROLE_")
            ? normalized
            : `ROLE_${normalized}`;
    };

    // =====================================================
    // ERROR MESSAGE
    // =====================================================

    const getErrorMessage = (err, fallback) => {

        const data = err?.response?.data;

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
    // LOAD AUTH STATE
    // =====================================================

    useEffect(() => {

        const refreshAuth = () => {

            setRole(
                localStorage.getItem("role")
            );

            setUserId(
                localStorage.getItem("userId")
            );
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

    useEffect(() => {

        loadJob();

    }, [id]);

    // =====================================================
    // LOAD JOB
    // =====================================================

    const loadJob = async () => {

        try {

            setLoading(true);

            const response =
                await API.get(
                    `/jobs/${id}`
                );

            setJob(response.data);

        } catch (err) {

            console.error(
                "Load job error:",
                err
            );

            setJob(null);

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // CHECK APPLICATION + SAVED JOB
    // =====================================================

    useEffect(() => {

        const normalizedRole =
            normalizeRole(role);

        const isJobSeeker =
            normalizedRole === "ROLE_JOB_SEEKER";

        if (
            job?.id &&
            userId &&
            isJobSeeker
        ) {

            checkApplication();
            checkSavedJob();

        } else {

            setAlreadyApplied(false);
            setAlreadySaved(false);
        }

    }, [job, userId, role]);

    // =====================================================
    // CHECK APPLICATION
    // =====================================================

    const checkApplication = async () => {

        try {

            setCheckingApplication(true);

            const response =
                await API.get(
                    "/applications/my"
                );

            const applications =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            const exists =
                applications.some(
                    (application) => {

                        const applicationJobId =
                            application.jobId ??
                            application.job?.id;

                        return (
                            String(applicationJobId) ===
                            String(job.id)
                        );
                    }
                );

            setAlreadyApplied(exists);

        } catch (err) {

            console.error(
                "Check application error:",
                err
            );

            setAlreadyApplied(false);

        } finally {

            setCheckingApplication(false);
        }
    };

    // =====================================================
    // CHECK SAVED JOB
    // =====================================================

    const checkSavedJob = async () => {

        try {

            setCheckingSaved(true);

            /*
             * The backend now gets the user
             * from the JWT.
             *
             * GET /saved-jobs/check?jobId={jobId}
             */

            const response =
                await API.get(
                    "/saved-jobs/check",
                    {
                        params: {
                            jobId: job.id
                        }
                    }
                );

            setAlreadySaved(
                response.data === true
            );

        } catch (err) {

            console.error(
                "Check saved job error:",
                err
            );

            setAlreadySaved(false);

        } finally {

            setCheckingSaved(false);
        }
    };

    // =====================================================
    // APPLY FOR JOB
    // =====================================================

    const applyJob = async () => {

        const token =
            localStorage.getItem("token");

        if (!token || !userId) {

            alert(
                "Please login before applying for a job."
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

        const normalizedRole =
            normalizeRole(role);

        if (
            normalizedRole !==
            "ROLE_JOB_SEEKER"
        ) {

            alert(
                "Only job seekers can apply for jobs."
            );

            return;
        }

        if (alreadyApplied) {

            alert(
                "You have already applied for this job."
            );

            return;
        }

        try {

            setApplying(true);

            /*
             * POST /applications/apply/{jobId}
             *
             * User ID is NOT sent.
             * Backend gets user from JWT.
             */

            const response =
                await API.post(
                    `/applications/apply/${job.id}`
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

            if (
                err.response?.status === 401
            ) {

                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("role");
                localStorage.removeItem("user");

                window.dispatchEvent(
                    new Event("authChanged")
                );

                navigate("/login");

                return;
            }

            alert(
                getErrorMessage(
                    err,
                    "Failed to apply for this job."
                )
            );

        } finally {

            setApplying(false);
        }
    };

    // =====================================================
    // SAVE JOB
    // =====================================================

    const saveJob = async () => {

        const token =
            localStorage.getItem("token");

        if (!token || !userId) {

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

        if (alreadySaved) {

            alert(
                "This job is already saved."
            );

            return;
        }

        try {

            setSaving(true);

            /*
             * SECURED ENDPOINT
             *
             * POST /saved-jobs?jobId={jobId}
             *
             * User ID is NOT sent.
             * Backend gets user from JWT.
             */

            const response =
                await API.post(
                    "/saved-jobs",
                    null,
                    {
                        params: {
                            jobId: job.id
                        }
                    }
                );

            console.log(
                "Save response:",
                response.data
            );

            setAlreadySaved(true);

            alert(
                "Job saved successfully!"
            );

        } catch (err) {

            console.error(
                "Save job error:",
                err
            );

            if (
                err.response?.status === 401
            ) {

                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("role");
                localStorage.removeItem("user");

                window.dispatchEvent(
                    new Event("authChanged")
                );

                navigate("/login");

                return;
            }

            alert(
                getErrorMessage(
                    err,
                    "Failed to save job."
                )
            );

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
                        type="button"
                        onClick={() =>
                            navigate("/jobs")
                        }
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

    const isJobSeeker =
        normalizeRole(role) ===
        "ROLE_JOB_SEEKER";

    // =====================================================
    // PAGE
    // =====================================================

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
                                    type="button"
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

                        {/* JOB TYPE */}

                        {job.jobType && (

                            <p>

                                <strong>
                                    Job Type:
                                </strong>{" "}

                                {job.jobType}

                            </p>
                        )}

                        {/* EXPERIENCE */}

                        {job.experienceLevel && (

                            <p>

                                <strong>
                                    Experience:
                                </strong>{" "}

                                {job.experienceLevel}

                            </p>
                        )}

                        {/* CATEGORY */}

                        {job.category && (

                            <p>

                                <strong>
                                    Category:
                                </strong>{" "}

                                {job.category}

                            </p>
                        )}

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
                                        type="button"
                                        disabled
                                        className="bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed"
                                    >
                                        ✓ Already Applied
                                    </button>

                                ) : (

                                    <button
                                        type="button"
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
                                    type="button"
                                    onClick={saveJob}
                                    disabled={
                                        saving ||
                                        alreadySaved ||
                                        checkingSaved
                                    }
                                    className={`${
                                        saving ||
                                        alreadySaved ||
                                        checkingSaved
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    } text-white px-6 py-3 rounded-lg`}
                                >

                                    {checkingSaved
                                        ? "Checking..."
                                        : alreadySaved
                                            ? "✓ Saved"
                                            : saving
                                                ? "Saving..."
                                                : "Save Job"}

                                </button>

                                {/* MY APPLICATIONS */}

                                <button
                                    type="button"
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
                            type="button"
                            onClick={() =>
                                navigate(-1)
                            }
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
                        >
                            Back
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default JobDetails;