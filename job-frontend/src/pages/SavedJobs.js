import { useEffect, useState } from "react";
import API from "../services/api";

function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      loadSavedJobs();
    } else {
      setLoading(false);
    }
  }, []);

  const loadSavedJobs = async () => {
    try {
      const res = await API.get(`/saved-jobs/${userId}`);
      setSavedJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to load saved jobs.");
    } finally {
      setLoading(false);
    }
  };

  const removeJob = async (jobId) => {
    try {
      await API.delete(`/saved-jobs?userId=${userId}&jobId=${jobId}`);

      setSavedJobs((prev) =>
        prev.filter((item) => item.job.id !== jobId)
      );

      alert("Job removed successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to remove job.");
    }
  };

  const applyJob = async (jobId) => {
    try {
      await API.post(`/applications/apply?userId=${userId}&jobId=${jobId}`);
      alert("Application submitted successfully.");
    } catch (err) {
      console.error(err);

      if (err.response) {
        alert(err.response.data);
      } else {
        alert("Failed to apply.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h2 className="text-2xl font-semibold">
          Loading Saved Jobs...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-8">
      <h1 className="text-4xl font-bold text-center mb-10">
        Saved Jobs
      </h1>

      {savedJobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">
            No Saved Jobs
          </h2>

          <p className="text-gray-500">
            Save jobs from the Jobs page to view them here.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((saved) => (
            <div
              key={saved.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300"
            >
              <h2 className="text-2xl font-bold text-blue-600">
                {saved.job.title}
              </h2>

              <p>
                <strong>Company:</strong> {saved.job.company}
              </p>

              <p>
                <strong>Location:</strong> {saved.job.location}
              </p>

              <p>
                <strong>Job Type:</strong> {saved.job.jobType}
              </p>

              <p>
                <strong>Salary:</strong> ₹{saved.job.salary}
              </p>

              <p className="mt-3 text-gray-600">
                {saved.job.description}
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => applyJob(saved.job.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                >
                  Apply
                </button>

                <button
                  onClick={() => removeJob(saved.job.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedJobs;