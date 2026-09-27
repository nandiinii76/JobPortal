import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const res = await API.get("/test"); // ✅ correct place
        setMessage(res.data);
      } catch (err) {
        alert("Unauthorized! Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchProtectedData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <h2>Dashboard</h2>

      <p>{message}</p>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;