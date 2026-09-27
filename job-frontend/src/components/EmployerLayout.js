import { Link, useNavigate } from "react-router-dom";

function EmployerLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-gray-900 text-white p-6">

        <h1 className="text-2xl font-bold text-blue-400 mb-10">
          Employer Panel
        </h1>

        <nav className="flex flex-col gap-5">

          <Link to="/employer-dashboard" className="hover:text-blue-400">
            Dashboard
          </Link>

          <Link to="/add-job" className="hover:text-blue-400">
            Add Job
          </Link>

          <Link to="/manage-applications" className="hover:text-blue-400">
            Applications
          </Link>

          <Link to="/analytics" className="hover:text-blue-400">
            Analytics
          </Link>

        </nav>

        <button
          onClick={handleLogout}
          className="mt-10 bg-red-500 w-full py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">
        {children}
      </div>

    </div>
  );
}

export default EmployerLayout;