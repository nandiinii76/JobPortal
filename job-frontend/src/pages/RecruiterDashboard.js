import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function RecruiterDashboard() {

    const navigate = useNavigate();

    const [stats, setStats] = useState({
        jobs: 0,
        applications: 0,
        users: 0
    });

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {

        try {

            const jobs = await API.get("/jobs/count");
            const applications = await API.get("/applications/count");
            const users = await API.get("/users/count");

            setStats({
                jobs: jobs.data,
                applications: applications.data,
                users: users.data
            });

        } catch (err) {
            console.log(err);
        }

    };

    return (

        <div className="min-h-screen bg-gray-100 p-10">

            <h1 className="text-4xl font-bold mb-10">
                Recruiter Dashboard
            </h1>

            <div className="grid md:grid-cols-3 gap-8">

                <div className="bg-white p-8 rounded-xl shadow">
                    <h3 className="text-lg font-semibold">
                        Total Jobs
                    </h3>

                    <h2 className="text-5xl text-blue-600 font-bold mt-4">
                        {stats.jobs}
                    </h2>
                </div>

                <div className="bg-white p-8 rounded-xl shadow">
                    <h3 className="text-lg font-semibold">
                        Applications
                    </h3>

                    <h2 className="text-5xl text-green-600 font-bold mt-4">
                        {stats.applications}
                    </h2>
                </div>

                <div className="bg-white p-8 rounded-xl shadow">
                    <h3 className="text-lg font-semibold">
                        Users
                    </h3>

                    <h2 className="text-5xl text-purple-600 font-bold mt-4">
                        {stats.users}
                    </h2>
                </div>

            </div>

            <div className="mt-12">

                <h2 className="text-2xl font-bold mb-6">
                    Quick Actions
                </h2>

                <div className="grid md:grid-cols-2 gap-6">

                    <button
                        onClick={() => navigate("/jobs")}
                        className="bg-blue-600 text-white p-5 rounded-lg hover:bg-blue-700"
                    >
                        View Jobs
                    </button>

                    <button
                        onClick={() => navigate("/manage-applications")}
                        className="bg-green-600 text-white p-5 rounded-lg hover:bg-green-700"
                    >
                        Manage Applications
                    </button>

                    <button
                        onClick={() => navigate("/analytics")}
                        className="bg-purple-600 text-white p-5 rounded-lg hover:bg-purple-700"
                    >
                        Analytics
                    </button>

                    <button
                        onClick={() => navigate("/profile")}
                        className="bg-orange-500 text-white p-5 rounded-lg hover:bg-orange-600"
                    >
                        My Profile
                    </button>

                </div>

            </div>

        </div>

    );
}

export default RecruiterDashboard;