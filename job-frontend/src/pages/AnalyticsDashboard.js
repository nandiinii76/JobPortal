import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./CandidateDashboard.css";

function AnalyticsDashboard() {

    const [stats, setStats] = useState({
        totalJobs: 0,
        totalApplications: 0,
        totalUsers: 0,
        shortlisted: 0,
        interviews: 0,
        hired: 0,
        rejected: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {

        try {

            const response = await API.get("/dashboard/analytics");

            setStats(response.data);

        } catch (error) {

            console.log(error);

            alert("Failed to load analytics");

        } finally {

            setLoading(false);

        }

    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <h1 className="text-3xl font-bold">Loading Dashboard...</h1>
            </div>
        );
    }

    return (

        <div className="min-h-screen bg-gray-100 p-8">

            <h1 className="text-4xl font-bold text-center mb-10">
                Employer Analytics Dashboard
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

                <div className="bg-blue-500 text-white rounded-xl p-6 shadow">
                    <h2 className="text-xl">Jobs</h2>
                    <p className="text-4xl font-bold">{stats.totalJobs}</p>
                </div>

                <div className="bg-green-500 text-white rounded-xl p-6 shadow">
                    <h2 className="text-xl">Applications</h2>
                    <p className="text-4xl font-bold">{stats.totalApplications}</p>
                </div>

                <div className="bg-purple-500 text-white rounded-xl p-6 shadow">
                    <h2 className="text-xl">Users</h2>
                    <p className="text-4xl font-bold">{stats.totalUsers}</p>
                </div>

                <div className="bg-yellow-500 text-white rounded-xl p-6 shadow">
                    <h2 className="text-xl">Shortlisted</h2>
                    <p className="text-4xl font-bold">{stats.shortlisted}</p>
                </div>

                <div className="bg-indigo-500 text-white rounded-xl p-6 shadow">
                    <h2 className="text-xl">Interviews</h2>
                    <p className="text-4xl font-bold">{stats.interviews}</p>
                </div>

                <div className="bg-emerald-600 text-white rounded-xl p-6 shadow">
                    <h2 className="text-xl">Hired</h2>
                    <p className="text-4xl font-bold">{stats.hired}</p>
                </div>

                <div className="bg-red-500 text-white rounded-xl p-6 shadow">
                    <h2 className="text-xl">Rejected</h2>
                    <p className="text-4xl font-bold">{stats.rejected}</p>
                </div>

            </div>

        </div>

    );

}

export default AnalyticsDashboard;