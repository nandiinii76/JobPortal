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
    // NORMALIZE ROLE
    // ==========================================

    const normalizeRole = (value) => {

        if (!value) {
            return "";
        }

        let normalized = String(value)
            .trim()
            .toUpperCase();

        while (normalized.startsWith("ROLE_ROLE_")) {
            normalized = normalized.substring(5);
        }

        switch (normalized) {

            case "USER":
            case "ROLE_USER":

            case "CANDIDATE":
            case "ROLE_CANDIDATE":

            case "JOBSEEKER":
            case "JOB_SEEKER":
            case "ROLE_JOBSEEKER":
            case "ROLE_JOB_SEEKER":

                return "ROLE_JOB_SEEKER";

            case "EMPLOYER":
            case "ROLE_EMPLOYER":

                return "ROLE_EMPLOYER";

            case "RECRUITER":
            case "ROLE_RECRUITER":

                return "ROLE_RECRUITER";

            case "ADMIN":
            case "ROLE_ADMIN":

                return "ROLE_ADMIN";

            default:

                if (normalized.startsWith("ROLE_")) {
                    return normalized;
                }

                return `ROLE_${normalized}`;
        }
    };

    // ==========================================
    // INPUT CHANGE
    // ==========================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
    };

    // ==========================================
    // LOGIN
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (loading) {
            return;
        }

        setError("");
        setLoading(true);

        try {

            // ======================================
            // LOGIN REQUEST
            // ======================================

            const response = await API.post(
                "/users/login",
                {
                    email: form.email.trim().toLowerCase(),
                    password: form.password
                }
            );

            const data = response.data;

            // ======================================
            // READ BACKEND RESPONSE
            // ======================================

            const token = data?.token;

            const userId =
                data?.userId ??
                data?.id ??
                data?.user?.id;

            const role = normalizeRole(
                data?.role ??
                data?.user?.role
            );

            // ======================================
            // VALIDATE RESPONSE
            // ======================================

            if (!token) {
                throw new Error(
                    "Login successful, but no authentication token was returned."
                );
            }

            if (
                userId === undefined ||
                userId === null ||
                userId === ""
            ) {
                throw new Error(
                    "Login successful, but no user ID was returned."
                );
            }

            if (!role) {
                throw new Error(
                    "Login successful, but no user role was returned."
                );
            }

            // ======================================
            // CLEAR OLD SESSION
            // ======================================

            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("role");
            localStorage.removeItem("user");

            // ======================================
            // STORE NEW SESSION
            // ======================================

            localStorage.setItem(
                "token",
                token
            );

            localStorage.setItem(
                "userId",
                String(userId)
            );

            localStorage.setItem(
                "role",
                role
            );

            // ======================================
            // ROLE-BASED REDIRECT
            // ======================================

            switch (role) {

                case "ROLE_JOB_SEEKER":

                    navigate(
                        "/candidate-dashboard",
                        { replace: true }
                    );

                    break;

                case "ROLE_EMPLOYER":

                    navigate(
                        "/employer-dashboard",
                        { replace: true }
                    );

                    break;

                case "ROLE_RECRUITER":

                    navigate(
                        "/recruiter-dashboard",
                        { replace: true }
                    );

                    break;

                case "ROLE_ADMIN":

                    // Admin dashboard does not exist yet.
                    // Use the existing protected dashboard.

                    navigate(
                        "/dashboard",
                        { replace: true }
                    );

                    break;

                default:

                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    localStorage.removeItem("role");

                    throw new Error(
                        `Unsupported user role: ${role}`
                    );
            }

        } catch (err) {

            console.error(
                "LOGIN ERROR:",
                err
            );

            // ======================================
            // BACKEND ERROR
            // ======================================

            if (err.response) {

                let message =
                    err.response.data?.message;

                if (!message) {
                    message =
                        typeof err.response.data === "string"
                            ? err.response.data
                            : err.response.data?.error;
                }

                if (!message) {

                    switch (err.response.status) {

                        case 401:
                            message =
                                "Invalid email or password.";
                            break;

                        case 403:
                            message =
                                "You are not authorized to log in.";
                            break;

                        case 404:
                            message =
                                "Login API was not found.";
                            break;

                        default:

                            if (
                                err.response.status >= 500
                            ) {
                                message =
                                    "Server error. Please try again later.";
                            } else {
                                message =
                                    "Login failed. Please check your details.";
                            }
                    }
                }

                setError(message);
            }

            // ======================================
            // SERVER UNAVAILABLE
            // ======================================

            else if (err.request) {

                setError(
                    "Unable to connect to the server. " +
                    "Make sure Spring Boot is running on port 8080."
                );
            }

            // ======================================
            // FRONTEND ERROR
            // ======================================

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

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

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

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

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