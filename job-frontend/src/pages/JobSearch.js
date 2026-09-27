import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function JobSearch() {

    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    // ==========================================
    // SEARCH FILTERS
    // ==========================================

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

            // TITLE
            if (title.trim()) {
                params.title = title.trim();
            }

            // LOCATION
            if (location.trim()) {
                params.location = location.trim();
            }

            // CATEGORY
            if (category) {
                params.category = category;
            }

            // JOB TYPE
            if (jobType) {
                params.jobType = jobType;
            }

            // EXPERIENCE
            if (experienceLevel) {
                params.experienceLevel = experienceLevel;
            }

            // MIN SALARY
            if (minSalary !== "") {
                params.minSalary = Number(minSalary);
            }

            // MAX SALARY
            if (maxSalary !== "") {
                params.maxSalary = Number(maxSalary);
            }

            console.log("SEARCH PARAMS:", params);

            // NO FILTERS
            if (Object.keys(params).length === 0) {

                await loadJobs();

                return;
            }

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

        } finally {

            setSearching(false);

        }
    };

    // ==========================================
    // RESET
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
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="min-h-screen bg-gray-100 flex items-center justify-center">

                <div className="text-center">

                    <div className="text-5xl mb-4">
                        🔍
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
                        Search Jobs
                    </h1>

                    <p className="text-gray-500 mt-3">
                        Find jobs based on your skills,
                        location and preferences.
                    </p>

                </div>

                {/* ==================================
                    SEARCH PANEL
                ================================== */}

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">

                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        Job Search
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

                    {/* ==================================
                        BUTTONS
                    ================================== */}

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
                    NO RESULTS
                ================================== */}

                {jobs.length === 0 ? (

                    <div className="
                        bg-white
                        rounded-2xl
                        shadow-lg
                        p-12
                        text-center
                    ">

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
                       JOB RESULTS
                    ================================== */

                    <div className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-8
                    ">

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

                                {/* JOB HEADER */}

                                <div className="
                                    flex
                                    justify-between
                                    items-start
                                    gap-4
                                ">

                                    <div>

                                        <h2 className="
                                            text-2xl
                                            font-bold
                                            text-blue-600
                                        ">
                                            {job.title}
                                        </h2>

                                        <p className="
                                            text-gray-600
                                            mt-1
                                        ">
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

                                {/* JOB DETAILS */}

                                <div className="
                                    mt-5
                                    space-y-2
                                    text-gray-700
                                ">

                                    <p>
                                        📍 <strong>Location:</strong>{" "}
                                        {job.location}
                                    </p>

                                    <p>
                                        💰 <strong>Salary:</strong>{" "}
                                        ₹{job.salary}
                                    </p>

                                    <p>
                                        🏷️ <strong>Category:</strong>{" "}
                                        {job.category}
                                    </p>

                                    <p>
                                        🎓 <strong>Experience:</strong>{" "}
                                        {job.experienceLevel}
                                    </p>

                                </div>

                                {/* DESCRIPTION */}

                                <p className="
                                    mt-5
                                    text-gray-600
                                    line-clamp-3
                                ">
                                    {job.description}
                                </p>

                                {/* VIEW DETAILS */}

                                <div className="mt-6">

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
                                            px-5
                                            py-2
                                            rounded-lg
                                            font-semibold
                                        "
                                    >
                                        View Details
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}

export default JobSearch;