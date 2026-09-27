import { useEffect, useState } from "react";
import API from "../services/api";

function EmployerDashboard() {

    const [analytics, setAnalytics] = useState({
        jobs: 0,
        applications: 0,
        users: 0,
        interviews: 0,
        shortlisted: 0,
        hired: 0
    });

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {

            const res = await API.get("/dashboard/analytics");

            setAnalytics(res.data);

        } catch (err) {
            console.log(err);
            alert("Failed to load analytics");
        }
    };

    return (

        <div className="dashboard-container">

            <h1>Employer Dashboard</h1>

            <div className="cards">

                <div className="card">
                    <h3>Total Jobs</h3>
                    <h2>{analytics.jobs}</h2>
                </div>

                <div className="card">
                    <h3>Applications</h3>
                    <h2>{analytics.applications}</h2>
                </div>

                <div className="card">
                    <h3>Users</h3>
                    <h2>{analytics.users}</h2>
                </div>

                <div className="card">
                    <h3>Interviews</h3>
                    <h2>{analytics.interviews}</h2>
                </div>

                <div className="card">
                    <h3>Shortlisted</h3>
                    <h2>{analytics.shortlisted}</h2>
                </div>

                <div className="card">
                    <h3>Hired</h3>
                    <h2>{analytics.hired}</h2>
                </div>

            </div>

        </div>

    );
}

export default EmployerDashboard;