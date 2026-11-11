import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AddJob() {

    const navigate = useNavigate();

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


    // ==========================================
    // HANDLE INPUT CHANGE
    // ==========================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setJob({
            ...job,
            [name]: value
        });
    };


    // ==========================================
    // SUBMIT JOB
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const request = {
                ...job,
                salary: Number(job.salary)
            };

            await API.post(
                "/jobs",
                request
            );

            alert("Job Posted Successfully");

            navigate("/employer-dashboard");

        } catch (err) {

            console.error("Job creation failed:", err);

            const message =
                err.response?.data?.message ||
                "Failed to post job";

            alert(message);
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

                    {/* JOB TITLE */}

                    <input
                        type="text"
                        name="title"
                        placeholder="Job Title"
                        value={job.title}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                        required
                    />


                    {/* COMPANY */}

                    <input
                        type="text"
                        name="company"
                        placeholder="Company"
                        value={job.company}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                        required
                    />


                    {/* LOCATION */}

                    <input
                        type="text"
                        name="location"
                        placeholder="Location"
                        value={job.location}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                        required
                    />


                    {/* SALARY */}

                    <input
                        type="number"
                        name="salary"
                        placeholder="Salary"
                        value={job.salary}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full border p-3 rounded-lg"
                        required
                    />


                    {/* CATEGORY */}

                    <select
                        name="category"
                        value={job.category}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                        required
                    >

                        <option value="">
                            Select Category
                        </option>

                        <option value="IT">
                            IT
                        </option>

                        <option value="Finance">
                            Finance
                        </option>

                        <option value="Marketing">
                            Marketing
                        </option>

                        <option value="HR">
                            HR
                        </option>

                        <option value="Sales">
                            Sales
                        </option>

                        <option value="Healthcare">
                            Healthcare
                        </option>

                    </select>


                    {/* JOB TYPE */}

                    <select
                        name="jobType"
                        value={job.jobType}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                        required
                    >

                        <option value="">
                            Select Job Type
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


                    {/* EXPERIENCE LEVEL */}

                    <select
                        name="experienceLevel"
                        value={job.experienceLevel}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                        required
                    >

                        <option value="">
                            Select Experience Level
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


                    {/* DESCRIPTION */}

                    <textarea
                        name="description"
                        placeholder="Job Description"
                        value={job.description}
                        onChange={handleChange}
                        rows="6"
                        className="w-full border p-3 rounded-lg"
                        required
                    />


                    {/* SUBMIT */}

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