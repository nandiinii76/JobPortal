import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Jobs() {

    const navigate = useNavigate();

    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    // ==========================================
    // STATE
    // ==========================================

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [category, setCategory] = useState("");
    const [jobType, setJobType] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("");
    const [minSalary, setMinSalary] = useState("");
    const [maxSalary, setMaxSalary] = useState("");

    // ==========================================
    // LOAD ALL JOBS
    // ==========================================

    const loadJobs = async () => {

        try {

            setLoading(true);

            const response = await API.get("/jobs");

            console.log("ALL JOBS:", response.data);

            setJobs(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error("LOAD JOBS ERROR:", error);

            setJobs([]);

            alert("Failed to load jobs.");

        } finally {

            setLoading(false);

        }
    };

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        loadJobs();

    }, []);

    // ==========================================
    // SEARCH JOBS
    // ==========================================

    const searchJobs = async () => {

        try {

            setSearching(true);

            const params = {};

            if (title.trim()) {
                params.title = title.trim();
            }

            if (location.trim()) {
                params.location = location.trim();
            }

            if (category) {
                params.category = category;
            }

            if (jobType) {
                params.jobType = jobType;
            }

            if (experienceLevel) {
                params.experienceLevel = experienceLevel;
            }

            if (minSalary !== "") {
                params.minSalary = Number(minSalary);
            }

            if (maxSalary !== "") {
                params.maxSalary = Number(maxSalary);
            }

            // No filters
            if (Object.keys(params).length === 0) {

                await loadJobs();

                return;
            }

            console.log("SEARCH PARAMS:", params);

            const response = await API.get(
                "/jobs/search",
                {
                    params: params
                }
            );

            console.log(
                "SEARCH RESULTS:",
                response.data
            );

            setJobs(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "SEARCH JOBS ERROR:",
                error
            );

            if (error.response) {

                console.error(
                    "STATUS:",
                    error.response.status
                );

                console.error(
                    "DATA:",
                    error.response.data
                );

            }

            setJobs([]);

            alert("Failed to search jobs.");

        } finally {

            setSearching(false);

        }
    };

    // ==========================================
    // RESET SEARCH
    // ==========================================

    const resetSearch = async () => {

        setTitle("");
        setLocation("");
        setCategory("");
        setJobType("");
        setExperienceLevel("");
        setMinSalary("");
        setMaxSalary("");

        await loadJobs();
    };

    // ==========================================
    // APPLY JOB
    // ==========================================

    const applyJob = async (jobId) => {

        if (!userId) {

            alert("Please login first.");

            navigate("/login");

            return;
        }

        try {

            await API.post(
                `/applications/apply`,
                null,
                {
                    params: {
                        userId: userId,
                        jobId: jobId
                    }
                }
            );

            alert(
                "Application submitted successfully."
            );

        } catch (error) {

            console.error(
                "APPLY JOB ERROR:",
                error
            );

            if (error.response) {

                alert(
                    typeof error.response.data === "string"
                        ? error.response.data
                        : "Failed to apply for job."
                );

            } else {

                alert("Failed to apply for job.");

            }
        }
    };

    // ==========================================
    // SAVE JOB
    // ==========================================

    const saveJob = async (jobId) => {

        if (!userId) {

            alert("Please login first.");

            navigate("/login");

            return;
        }

        try {

            await API.post(
                `/saved/save`,
                null,
                {
                    params: {
                        userId: userId,
                        jobId: jobId
                    }
                }
            );

            alert(
                "Job saved successfully."
            );

        } catch (error) {

            console.error(
                "SAVE JOB ERROR:",
                error
            );

            if (error.response) {

                alert(
                    typeof error.response.data === "string"
                        ? error.response.data
                        : "Failed to save job."
                );

            } else {

                alert("Failed to save job.");

            }
        }
    };

    // ==========================================
    // DELETE JOB
    // ==========================================

    const deleteJob = async (jobId) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this job?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await API.delete(
                `/jobs/${jobId}`
            );

            alert(
                "Job deleted successfully."
            );

            await loadJobs();

        } catch (error) {

            console.error(
                "DELETE JOB ERROR:",
                error
            );

            alert(
                "Failed to delete job."
            );
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="min-h-screen bg-gray-100 flex items-center justify-center">

                <div className="text-center">

                    <div className="text-5xl mb-4">
                        💼
                    </div>

                    <h2 className="text-3xl font-bold text-gray-700">
                        Loading Jobs...
                    </h2>

                </div>

            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="min-h-screen bg-gray-100 py-10">

            <div className="max-w-7xl mx-auto px-6">

                {/* ==================================
                    HEADER
                ================================== */}

                <div className="text-center mb-10">

                    <h1 className="text-4xl font-bold text-gray-800">
                        Find Your Dream Job
                    </h1>

                    <p className="text-gray-500 mt-3">
                        Search and explore the latest job opportunities.
                    </p>

                </div>

                {/* ==================================
                    SEARCH PANEL
                ================================== */}

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">

                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        Search Jobs
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        {/* TITLE */}

                        <input
                            type="text"
                            placeholder="Job title or keyword"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            className="
                                border
                                border-gray-300
                                rounded-lg
                                px-4
                                py-3
                                focus:outline-none
                                focus:ring-2
                                focus:ring-blue-500
                            "
                        />

                        {/* LOCATION */}

                        <input
                            type="text"
                            placeholder="Location"
                            value={location}
                            onChange={(e) =>
                                setLocation(e.target.value)
                            }
                            className="
                                border
                                border-gray-300
                                rounded-lg
                                px-4
                                py-3
                                focus:outline-none
                                focus:ring-2
                                focus:ring-blue-500
                            "
                        />

                        {/* CATEGORY */}

                        <select
                            value={category}
                            onChange={(e) =>
                                setCategory(e.target.value)
                            }
                            className="
                                border
                                border-gray-300
                                rounded-lg
                                px-4
                                py-3
                                bg-white
                            "
                        >

                            <option value="">
                                All Categories
                            </option>

                            <option value="IT">
                                IT
                            </option>

                            <option value="Finance">
                                Finance
                            </option>

                            <option value="HR">
                                HR
                            </option>

                            <option value="Marketing">
                                Marketing
                            </option>

                            <option value="Healthcare">
                                Healthcare
                            </option>

                        </select>

                        {/* JOB TYPE */}

                        <select
                            value={jobType}
                            onChange={(e) =>
                                setJobType(e.target.value)
                            }
                            className="
                                border
                                border-gray-300
                                rounded-lg
                                px-4
                                py-3
                                bg-white
                            "
                        >

                            <option value="">
                                All Job Types
                            </option>

                            <option value="Full Time">
                                Full Time
                            </option>

                            <option value="Part Time">
                                Part Time
                            </option>

                            <option value="Internship">
                                Internship
                            </option>

                            <option value="Contract">
                                Contract
                            </option>

                            <option value="Remote">
                                Remote
                            </option>

                        </select>

                        {/* EXPERIENCE */}

                        <select
                            value={experienceLevel}
                            onChange={(e) =>
                                setExperienceLevel(
                                    e.target.value
                                )
                            }
                            className="
                                border
                                border-gray-300
                                rounded-lg
                                px-4
                                py-3
                                bg-white
                            "
                        >

                            <option value="">
                                All Experience Levels
                            </option>

                            <option value="Fresher">
                                Fresher
                            </option>

                            <option value="1-3 Years">
                                1-3 Years
                            </option>

                            <option value="3-5 Years">
                                3-5 Years
                            </option>

                            <option value="5+ Years">
                                5+ Years
                            </option>

                        </select>

                        {/* MIN SALARY */}

                        <input
                            type="number"
                            placeholder="Minimum salary"
                            value={minSalary}
                            onChange={(e) =>
                                setMinSalary(e.target.value)
                            }
                            className="
                                border
                                border-gray-300
                                rounded-lg
                                px-4
                                py-3
                            "
                        />

                        {/* MAX SALARY */}

                        <input
                            type="number"
                            placeholder="Maximum salary"
                            value={maxSalary}
                            onChange={(e) =>
                                setMaxSalary(e.target.value)
                            }
                            className="
                                border
                                border-gray-300
                                rounded-lg
                                px-4
                                py-3
                            "
                        />

                    </div>

                    {/* BUTTONS */}

                    <div className="flex flex-wrap gap-4 mt-6">

                        <button
                            onClick={searchJobs}
                            disabled={searching}
                            className="
                                bg-blue-600
                                hover:bg-blue-700
                                disabled:bg-blue-300
                                text-white
                                px-6
                                py-3
                                rounded-lg
                                font-semibold
                            "
                        >

                            {searching
                                ? "Searching..."
                                : "🔍 Search Jobs"}

                        </button>

                        <button
                            onClick={resetSearch}
                            className="
                                bg-gray-600
                                hover:bg-gray-700
                                text-white
                                px-6
                                py-3
                                rounded-lg
                                font-semibold
                            "
                        >
                            Reset
                        </button>

                    </div>

                </div>

                {/* ==================================
                    RESULT COUNT
                ================================== */}

                <div className="mb-6">

                    <h2 className="text-2xl font-bold text-gray-800">

                        {jobs.length}{" "}

                        {jobs.length === 1
                            ? "Job"
                            : "Jobs"}{" "}
                        Found

                    </h2>

                </div>

                {/* ==================================
                    NO JOBS
                ================================== */}

                {jobs.length === 0 ? (

                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">

                        <div className="text-6xl mb-5">
                            🔎
                        </div>

                        <h2 className="text-2xl font-bold text-gray-700">
                            No Jobs Found
                        </h2>

                        <p className="text-gray-500 mt-3">
                            Try changing your search filters.
                        </p>

                    </div>

                ) : (

                    /* ==================================
                       JOB CARDS
                    ================================== */

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {jobs.map((job) => (

                            <div
                                key={job.id}
                                className="
                                    bg-white
                                    rounded-2xl
                                    shadow-lg
                                    p-6
                                    hover:shadow-xl
                                    transition
                                "
                            >

                                <div className="flex justify-between items-start gap-4">

                                    <div>

                                        <h2 className="text-2xl font-bold text-blue-600">
                                            {job.title}
                                        </h2>

                                        <p className="text-gray-600 mt-1">
                                            {job.company}
                                        </p>

                                    </div>

                                    <span className="
                                        bg-blue-100
                                        text-blue-700
                                        px-3
                                        py-1
                                        rounded-full
                                        text-sm
                                        font-semibold
                                    ">
                                        {job.jobType}
                                    </span>

                                </div>

                                <div className="mt-5 space-y-2 text-gray-700">

                                    <p>
                                        📍{" "}
                                        <strong>
                                            Location:
                                        </strong>{" "}
                                        {job.location}
                                    </p>

                                    <p>
                                        💰{" "}
                                        <strong>
                                            Salary:
                                        </strong>{" "}
                                        ₹{job.salary}
                                    </p>

                                    <p>
                                        🏷️{" "}
                                        <strong>
                                            Category:
                                        </strong>{" "}
                                        {job.category}
                                    </p>

                                    <p>
                                        🎓{" "}
                                        <strong>
                                            Experience:
                                        </strong>{" "}
                                        {job.experienceLevel}
                                    </p>

                                </div>

                                <p className="
                                    mt-5
                                    text-gray-600
                                    line-clamp-3
                                ">
                                    {job.description}
                                </p>

                                {/* ACTIONS */}

                                <div className="flex flex-wrap gap-3 mt-6">

                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/jobs/${job.id}`
                                            )
                                        }
                                        className="
                                            bg-indigo-600
                                            hover:bg-indigo-700
                                            text-white
                                            px-4
                                            py-2
                                            rounded-lg
                                            font-semibold
                                        "
                                    >
                                        View Details
                                    </button>

                                    {role === "ROLE_JOB_SEEKER" && (

                                        <>

                                            <button
                                                onClick={() =>
                                                    applyJob(job.id)
                                                }
                                                className="
                                                    bg-green-600
                                                    hover:bg-green-700
                                                    text-white
                                                    px-4
                                                    py-2
                                                    rounded-lg
                                                    font-semibold
                                                "
                                            >
                                                Apply
                                            </button>

                                            <button
                                                onClick={() =>
                                                    saveJob(job.id)
                                                }
                                                className="
                                                    bg-blue-600
                                                    hover:bg-blue-700
                                                    text-white
                                                    px-4
                                                    py-2
                                                    rounded-lg
                                                    font-semibold
                                                "
                                            >
                                                Save Job
                                            </button>

                                        </>

                                    )}

                                    {role === "ROLE_EMPLOYER" && (

                                        <>

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/edit-job/${job.id}`
                                                    )
                                                }
                                                className="
                                                    bg-yellow-500
                                                    hover:bg-yellow-600
                                                    text-white
                                                    px-4
                                                    py-2
                                                    rounded-lg
                                                    font-semibold
                                                "
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() =>
                                                    deleteJob(job.id)
                                                }
                                                className="
                                                    bg-red-600
                                                    hover:bg-red-700
                                                    text-white
                                                    px-4
                                                    py-2
                                                    rounded-lg
                                                    font-semibold
                                                "
                                            >
                                                Delete
                                            </button>

                                        </>

                                    )}

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}

export default Jobs;