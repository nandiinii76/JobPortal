import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ==========================================
    // HANDLE INPUT CHANGE
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }));

        setError("");
    };

    // ==========================================
    // HANDLE LOGIN
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) {
            return;
        }

        setError("");
        setLoading(true);

        try {
            // ==========================================
            // CALL BACKEND LOGIN API
            // ==========================================

            const res = await API.post("/users/login", {
                email: form.email.trim(),
                password: form.password
            });

            console.log("LOGIN RESPONSE:", res.data);

            // ==========================================
            // READ RESPONSE
            // ==========================================

            const token = res.data?.token;

            const userId =
                res.data?.userId ??
                res.data?.id ??
                res.data?.user?.id;

            let role =
                res.data?.role ??
                res.data?.user?.role;

            // ==========================================
            // VALIDATE TOKEN
            // ==========================================

            if (!token) {
                console.error("Login response does not contain token.");

                throw new Error(
                    "Login successful, but the server did not return an authentication token."
                );
            }

            // ==========================================
            // VALIDATE USER ID
            // ==========================================

            if (
                userId === undefined ||
                userId === null ||
                userId === ""
            ) {
                console.error("Login response does not contain user ID.");

                throw new Error(
                    "Login successful, but the server did not return a user ID."
                );
            }

            // ==========================================
            // VALIDATE ROLE
            // ==========================================

            if (!role) {
                console.error("Login response does not contain role.");

                throw new Error(
                    "Login successful, but the server did not return a user role."
                );
            }

            // ==========================================
            // NORMALIZE ROLE
            // ==========================================

            role = String(role).trim().toUpperCase();

            if (!role.startsWith("ROLE_")) {
                role = `ROLE_${role}`;
            }

            console.log("USER ID:", userId);
            console.log("ROLE:", role);

            // ==========================================
            // CLEAR OLD LOGIN DATA
            // ==========================================

            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("role");
            localStorage.removeItem("user");

            // ==========================================
            // STORE NEW LOGIN DATA
            // ==========================================

            localStorage.setItem("token", token);
            localStorage.setItem("userId", String(userId));
            localStorage.setItem("role", role);

            // ==========================================
            // VERIFY STORED DATA
            // ==========================================

            console.log(
                "Stored userId:",
                localStorage.getItem("userId")
            );

            console.log(
                "Stored role:",
                localStorage.getItem("role")
            );

            // ==========================================
            // REDIRECT BASED ON ROLE
            // ==========================================

            switch (role) {

                // ======================================
                // JOB SEEKER
                // ======================================

                case "ROLE_JOB_SEEKER":
                    navigate("/candidate-dashboard", {
                        replace: true
                    });
                    break;

                // ======================================
                // CANDIDATE ALIASES
                // ======================================

                case "ROLE_CANDIDATE":
                case "ROLE_USER":
                    navigate("/candidate-dashboard", {
                        replace: true
                    });
                    break;

                // ======================================
                // EMPLOYER
                // ======================================

                case "ROLE_EMPLOYER":
                    navigate("/employer-dashboard", {
                        replace: true
                    });
                    break;

                // ======================================
                // RECRUITER
                // ======================================

                case "ROLE_RECRUITER":
                    navigate("/recruiter-dashboard", {
                        replace: true
                    });
                    break;

                // ======================================
                // ADMIN
                // ======================================

                case "ROLE_ADMIN":
                    navigate("/admin-dashboard", {
                        replace: true
                    });
                    break;

                // ======================================
                // UNKNOWN ROLE
                // ======================================

                default:
                    console.error(
                        "Unknown user role:",
                        role
                    );

                    setError(
                        `Unknown user role received from server: ${role}`
                    );

                    // Remove invalid login data
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    localStorage.removeItem("role");
                    break;
            }

        } catch (err) {

            console.error("LOGIN ERROR:", err);

            // ==========================================
            // HTTP ERROR FROM BACKEND
            // ==========================================

            if (err.response) {

                console.error(
                    "SERVER STATUS:",
                    err.response.status
                );

                console.error(
                    "SERVER RESPONSE:",
                    err.response.data
                );

                let message =
                    err.response.data?.message;

                if (!message) {
                    message =
                        err.response.data?.error;
                }

                if (!message) {
                    if (err.response.status === 401) {
                        message =
                            "Invalid email or password.";
                    } else if (err.response.status === 403) {
                        message =
                            "You are not authorized to log in.";
                    } else if (err.response.status === 404) {
                        message =
                            "Login API was not found.";
                    } else if (err.response.status >= 500) {
                        message =
                            "Server error. Please try again later.";
                    } else {
                        message =
                            "Login failed. Please check your details.";
                    }
                }

                setError(message);
            }

            // ==========================================
            // REQUEST SENT BUT SERVER DID NOT RESPOND
            // ==========================================

            else if (err.request) {

                console.error(
                    "NO SERVER RESPONSE:",
                    err.request
                );

                setError(
                    "Unable to connect to the server. " +
                    "Make sure Spring Boot is running on port 8080."
                );
            }

            // ==========================================
            // FRONTEND / OTHER ERROR
            // ==========================================

            else {

                setError(
                    err.message ||
                    "Login failed. Please try again."
                );
            }

        } finally {

            setLoading(false);
        }
    };

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="auth-container">

            <div className="auth-card">

                <h2>Login</h2>

                {/* ==================================
                    ERROR MESSAGE
                ================================== */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* ==================================
                    LOGIN FORM
                ================================== */}

                <form onSubmit={handleSubmit}>

                    {/* EMAIL */}

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter Email"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                        disabled={loading}
                    />

                    {/* PASSWORD */}

                    <input
                        type="password"
                        name="password"
                        placeholder="Enter Password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                        disabled={loading}
                    />

                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

                {/* ==================================
                    REGISTER
                ================================== */}

                <p>
                    Don't have an account?{" "}

                    <Link to="/register">
                        Register
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Login;