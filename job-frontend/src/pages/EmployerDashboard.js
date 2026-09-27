import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function EmployerDashboard() {

    const navigate = useNavigate();

    const employerId = localStorage.getItem("userId");

    const [jobs, setJobs] = useState([]);

    const [stats, setStats] = useState({
        totalJobs: 0,
        totalApplications: 0
    });

    const [loading, setLoading] = useState(true);

    // ==========================================
    // LOAD DASHBOARD
    // ==========================================

    const loadDashboard = async () => {

        try {

            setLoading(true);

            // GET EMPLOYER JOBS

            const jobsResponse =
                await API.get(
                    `/jobs/employer/${employerId}`
                );

            setJobs(
                Array.isArray(jobsResponse.data)
                    ? jobsResponse.data
                    : []
            );

            // GET ANALYTICS

            const analyticsResponse =
                await API.get(
                    `/analytics/employer/${employerId}`
                );

            setStats({
                totalJobs:
                    analyticsResponse.data.totalJobs || 0,

                totalApplications:
                    analyticsResponse.data.totalApplications || 0
            });

        } catch (error) {

            console.error(
                "DASHBOARD ERROR:",
                error
            );

        } finally {

            setLoading(false);

        }

    };

    // ==========================================
    // LOAD DASHBOARD ON PAGE OPEN
    // ==========================================

    useEffect(() => {

        if (employerId) {

            loadDashboard();

        }

    }, []);

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

            await loadDashboard();

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

                <h2 className="text-2xl font-bold text-gray-700">

                    Loading Employer Dashboard...

                </h2>

            </div>

        );

    }

    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="min-h-screen bg-gray-100 p-10">

            {/* HEADER */}

            <div className="mb-10">

                <h1 className="text-4xl font-bold">

                    Employer Dashboard

                </h1>

                <p className="text-gray-500 mt-2">

                    Manage your jobs and applications.

                </p>

            </div>


            {/* ==========================================
                DASHBOARD STATISTICS
            ========================================== */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

                {/* TOTAL JOBS */}

                <div className="bg-white rounded-xl shadow-lg p-6 text-center">

                    <h3 className="text-lg font-semibold">

                        Total Jobs

                    </h3>

                    <h2 className="text-4xl font-bold text-blue-600 mt-3">

                        {stats.totalJobs}

                    </h2>

                </div>


                {/* TOTAL APPLICATIONS */}

                <div className="bg-white rounded-xl shadow-lg p-6 text-center">

                    <h3 className="text-lg font-semibold">

                        Total Applications

                    </h3>

                    <h2 className="text-4xl font-bold text-green-600 mt-3">

                        {stats.totalApplications}

                    </h2>

                </div>

            </div>


            {/* ==========================================
                QUICK ACTIONS
            ========================================== */}

            <div className="mb-10">

                <h2 className="text-2xl font-bold mb-5">

                    Quick Actions

                </h2>

                <div className="flex flex-wrap gap-4">

                    <button
                        onClick={() =>
                            navigate("/add-job")
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    >

                        Post New Job

                    </button>


                    <button
                        onClick={() =>
                            navigate("/manage-applications")
                        }
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
                    >

                        Manage Applications

                    </button>


                    <button
                        onClick={() =>
                            navigate("/manage-interviews")
                        }
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg"
                    >

                        Manage Interviews

                    </button>


                    <button
                        onClick={() =>
                            navigate("/analytics")
                        }
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
                    >

                        Analytics

                    </button>


                    <button
                        onClick={() =>
                            navigate("/employer-profile")
                        }
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg"
                    >

                        Employer Profile

                    </button>

                </div>

            </div>


            {/* ==========================================
                POSTED JOBS
            ========================================== */}

            <div className="bg-white rounded-xl shadow-lg p-8">

                <h2 className="text-3xl font-bold mb-8">

                    My Posted Jobs

                </h2>


                {jobs.length === 0 ? (

                    <div className="text-center py-10 text-xl text-gray-500">

                        No jobs posted yet.

                    </div>

                ) : (

                    <div className="space-y-6">

                        {jobs.map((job) => (

                            <div
                                key={job.id}
                                className="border rounded-xl p-6 shadow-sm hover:shadow-lg transition"
                            >

                                <div className="flex justify-between items-start">

                                    <div>

                                        <h3 className="text-2xl font-bold text-blue-600">

                                            {job.title}

                                        </h3>

                                        <p className="text-gray-600 mt-1">

                                            {job.company}

                                        </p>

                                    </div>

                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">

                                        {job.jobType}

                                    </span>

                                </div>


                                <div className="mt-5 space-y-2">

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


                                <p className="mt-4 text-gray-600">

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
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                                    >

                                        View Details

                                    </button>


                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/edit-job/${job.id}`
                                            )
                                        }
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg"
                                    >

                                        Edit

                                    </button>


                                    <button
                                        onClick={() =>
                                            navigate(
                                                "/manage-applications"
                                            )
                                        }
                                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
                                    >

                                        View Applications

                                    </button>


                                    <button
                                        onClick={() =>
                                            deleteJob(job.id)
                                        }
                                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
                                    >

                                        Delete

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

export default EmployerDashboard;