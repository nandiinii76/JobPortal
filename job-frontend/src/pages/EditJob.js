import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function EditJob() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [job, setJob] = useState({

        title: "",
        company: "",
        location: "",
        salary: "",
        description: "",
        category: "",
        jobType: "",
        experienceLevel: ""

    });

    useEffect(() => {

        loadJob();

    }, []);

    const loadJob = async () => {

        try {

            const res = await API.get(`/jobs/${id}`);

            setJob(res.data);

        }

        catch (err) {

            console.log(err);

            alert("Failed to load job.");

        }

    };

    const handleChange = (e) => {

        setJob({

            ...job,

            [e.target.name]: e.target.value

        });

    };
        const updateJob = async (e) => {

        e.preventDefault();

        try {

            await API.put(`/jobs/${id}`, job);

            alert("Job Updated Successfully");

            navigate("/employer-dashboard");

        }

        catch (err) {

            console.log(err);

            alert("Failed to update job");

        }

    };
    return (

<div className="min-h-screen bg-gray-100 flex justify-center items-center">

<div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl">

<h1 className="text-3xl font-bold mb-6">
Edit Job
</h1>

<form onSubmit={updateJob} className="space-y-4">

<input
type="text"
name="title"
placeholder="Job Title"
value={job.title}
onChange={handleChange}
className="w-full border p-3 rounded"
/>

<input
type="text"
name="company"
placeholder="Company"
value={job.company}
onChange={handleChange}
className="w-full border p-3 rounded"
/>

<input
type="text"
name="location"
placeholder="Location"
value={job.location}
onChange={handleChange}
className="w-full border p-3 rounded"
/>

<input
type="number"
name="salary"
placeholder="Salary"
value={job.salary}
onChange={handleChange}
className="w-full border p-3 rounded"
/>

<select
name="category"
value={job.category}
onChange={handleChange}
className="w-full border p-3 rounded"
>
<option value="">Category</option>
<option value="IT">IT</option>
<option value="Finance">Finance</option>
<option value="HR">HR</option>
<option value="Marketing">Marketing</option>
<option value="Healthcare">Healthcare</option>
</select>

<select
name="jobType"
value={job.jobType}
onChange={handleChange}
className="w-full border p-3 rounded"
>
<option value="">Job Type</option>
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
className="w-full border p-3 rounded"
>
<option value="">Experience</option>
<option value="Fresher">Fresher</option>
<option value="1-3 Years">1-3 Years</option>
<option value="3-5 Years">3-5 Years</option>
<option value="5+ Years">5+ Years</option>
</select>

<textarea
name="description"
placeholder="Job Description"
rows="5"
value={job.description}
onChange={handleChange}
className="w-full border p-3 rounded"
/>

<button
type="submit"
className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
>
Update Job
</button>

</form>

</div>

</div>

);

}

export default EditJob;