import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AddJob() {

    const navigate = useNavigate();

    const employerId = localStorage.getItem("userId");

    const [job, setJob] = useState({
        title: "",
        company: "",
        location: "",
        description: "",
        salary: "",
        category: "",
        jobType: "",
        experienceLevel: ""
    });

    const handleChange = (e) => {
        setJob({
            ...job,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await API.post(
                `/jobs?employerId=${employerId}`,
                job
            );

            alert("Job Posted Successfully");

            navigate("/employer-dashboard");

        } catch (err) {

            console.log(err);

            alert("Failed to post job");
        }
    };

    return (

        <div className="min-h-screen bg-gray-100 py-10">

            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">

                <h1 className="text-3xl font-bold text-center mb-8">
                    Post New Job
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <input
                        type="text"
                        name="title"
                        placeholder="Job Title"
                        value={job.title}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                        required
                    />

                    <input
                        type="text"
                        name="company"
                        placeholder="Company"
                        value={job.company}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                        required
                    />

                    <input
                        type="text"
                        name="location"
                        placeholder="Location"
                        value={job.location}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                        required
                    />

                    <input
                        type="number"
                        name="salary"
                        placeholder="Salary"
                        value={job.salary}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                        required
                    />

                    <select
                        name="category"
                        value={job.category}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                        required
                    >
                        <option value="">Select Category</option>
                        <option value="IT">IT</option>
                        <option value="Finance">Finance</option>
                        <option value="Marketing">Marketing</option>
                        <option value="HR">HR</option>
                        <option value="Sales">Sales</option>
                        <option value="Healthcare">Healthcare</option>
                    </select>

                    <select
                        name="jobType"
                        value={job.jobType}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                        required
                    >
                        <option value="">Select Job Type</option>
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Internship">Internship</option>
                        <option value="Contract">Contract</option>
                        <option value="Remote">Remote</option>
                    </select>

                    <select
                        name="experienceLevel"
                        value={job.experienceLevel}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                        required
                    >
                        <option value="">Select Experience Level</option>
                        <option value="Fresher">Fresher</option>
                        <option value="1-3 Years">1-3 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5+ Years">5+ Years</option>
                    </select>

                    <textarea
                        name="description"
                        placeholder="Job Description"
                        value={job.description}
                        onChange={handleChange}
                        rows="6"
                        className="w-full border p-3 rounded-lg"
                        required
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                    >
                        Post Job
                    </button>

                </form>

            </div>

        </div>

    );
}

export default AddJob;