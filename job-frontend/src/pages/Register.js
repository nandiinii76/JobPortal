import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "ROLE_JOB_SEEKER"
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =====================================================
    // HANDLE INPUT
    // =====================================================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

        setError("");
    };

    // =====================================================
    // REGISTER
    // =====================================================

    const register = async (e) => {

        e.preventDefault();

        if (loading) {
            return;
        }

        setError("");
        setLoading(true);

        try {

            // =================================================
            // CLEAN REQUEST DATA
            // =================================================

            const requestData = {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
                role: form.role
            };

            console.log(
                "REGISTER REQUEST:",
                requestData
            );

            // =================================================
            // API REQUEST
            // =================================================

            const res = await API.post(
                "/users/register",
                requestData
            );

            console.log(
                "REGISTER RESPONSE:",
                res.data
            );

            // =================================================
            // SUCCESS
            // =================================================

            alert(
                "Registration successful! Please login."
            );

            navigate("/login");

        } catch (err) {

            console.error(
                "REGISTRATION ERROR:",
                err
            );

            // =================================================
            // SERVER RESPONSE
            // =================================================

            if (err.response) {

                console.error(
                    "SERVER STATUS:",
                    err.response.status
                );

                console.error(
                    "SERVER RESPONSE:",
                    err.response.data
                );

                const serverMessage =
                    err.response.data?.message ||
                    (
                        typeof err.response.data === "string"
                            ? err.response.data
                            : "Registration failed."
                    );

                setError(serverMessage);

            }

            // =================================================
            // SERVER NOT REACHABLE
            // =================================================

            else if (err.request) {

                setError(
                    "Unable to connect to the server. " +
                    "Make sure Spring Boot is running on port 8080."
                );

            }

            // =================================================
            // OTHER ERROR
            // =================================================

            else {

                setError(
                    err.message ||
                    "Registration failed."
                );
            }

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="min-h-screen bg-gray-100 flex justify-center items-center">

            <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-lg">

                <h1 className="text-4xl font-bold text-center mb-8">
                    Create Account
                </h1>

                {/* =================================================
                    ERROR MESSAGE
                ================================================= */}

                {error && (
                    <div className="mb-5 p-3 rounded-lg bg-red-100 text-red-700 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={register}>

                    {/* NAME */}

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg mb-4"
                        required
                        minLength={2}
                    />

                    {/* EMAIL */}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg mb-4"
                        required
                    />

                    {/* PASSWORD */}

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg mb-4"
                        required
                        minLength={6}
                    />

                    {/* ROLE */}

                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg mb-6"
                        required
                    >

                        <option value="ROLE_JOB_SEEKER">
                            Job Seeker
                        </option>

                        <option value="ROLE_EMPLOYER">
                            Employer
                        </option>

                        <option value="ROLE_RECRUITER">
                            Recruiter
                        </option>

                    </select>

                    {/* REGISTER BUTTON */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg"
                    >

                        {loading
                            ? "Creating Account..."
                            : "Register"}

                    </button>

                </form>

                <p className="text-center mt-5">

                    Already have an account?{" "}

                    <Link
                        to="/login"
                        className="text-blue-600 font-semibold"
                    >
                        Login
                    </Link>

                </p>

            </div>

        </div>
    );
}

export default Register;