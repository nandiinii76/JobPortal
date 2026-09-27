import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Profile.css";

function Profile() {

    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const storedRole = localStorage.getItem("role");


    // =====================================================
    // PROFILE STATE
    // =====================================================

    const [profile, setProfile] = useState({
        id: "",
        name: "",
        email: "",
        role: "",
        contactNumber: ""
    });


    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    // =====================================================
    // PASSWORD STATE
    // =====================================================

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });


    const [changingPassword, setChangingPassword] =
        useState(false);

    const [passwordMessage, setPasswordMessage] =
        useState("");

    const [passwordError, setPasswordError] =
        useState("");


    // =====================================================
    // NORMALIZE ROLE
    // =====================================================

    const normalizeRole = (value) => {

        if (!value) {
            return "";
        }

        let role = String(value)
            .trim()
            .toUpperCase();


        if (role === "USER" ||
            role === "ROLE_USER" ||
            role === "CANDIDATE" ||
            role === "ROLE_CANDIDATE" ||
            role === "JOBSEEKER" ||
            role === "JOB_SEEKER") {

            return "ROLE_JOB_SEEKER";
        }


        if (role === "EMPLOYER") {
            return "ROLE_EMPLOYER";
        }


        if (role === "RECRUITER") {
            return "ROLE_RECRUITER";
        }


        if (role === "ADMIN") {
            return "ROLE_ADMIN";
        }


        if (!role.startsWith("ROLE_")) {
            return `ROLE_${role}`;
        }


        return role;
    };


    // =====================================================
    // FORMAT ROLE FOR DISPLAY
    // =====================================================

    const formatRole = (role) => {

        if (!role) {
            return "User";
        }


        switch (normalizeRole(role)) {

            case "ROLE_JOB_SEEKER":
                return "Job Seeker";

            case "ROLE_EMPLOYER":
                return "Employer";

            case "ROLE_RECRUITER":
                return "Recruiter";

            case "ROLE_ADMIN":
                return "Administrator";

            default:
                return role
                    .replace("ROLE_", "")
                    .replaceAll("_", " ");
        }
    };


    // =====================================================
    // LOAD PROFILE
    // =====================================================

    const loadProfile = async () => {

        if (!token || !userId) {

            navigate("/login", {
                replace: true
            });

            return;
        }


        try {

            setLoading(true);
            setError("");
            setMessage("");


            const response = await API.get(
                `/users/${userId}`
            );


            const data = response.data || {};


            setProfile({
                id: data.id ?? userId,
                name: data.name ?? "",
                email: data.email ?? "",
                role: data.role ?? storedRole ?? "",
                contactNumber:
                    data.contactNumber ?? ""
            });


        } catch (err) {

            console.error(
                "Failed to load profile:",
                err
            );


            if (err.response?.status === 401 ||
                err.response?.status === 403) {

                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("role");
                localStorage.removeItem("user");

                navigate("/login", {
                    replace: true
                });

                return;
            }


            setError(
                err.response?.data ||
                "Unable to load profile."
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadProfile();

    }, []);


    // =====================================================
    // PROFILE INPUT CHANGE
    // =====================================================

    const handleProfileChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setProfile(previous => ({
            ...previous,
            [name]: value
        }));


        setMessage("");
        setError("");
    };


    // =====================================================
    // SAVE PROFILE
    // =====================================================

    const handleSaveProfile = async (event) => {

        event.preventDefault();


        if (!profile.name.trim()) {

            setError(
                "Name is required."
            );

            return;
        }


        try {

            setSaving(true);
            setError("");
            setMessage("");


            const response = await API.put(
                `/users/${userId}`,
                {
                    name: profile.name.trim(),
                    contactNumber:
                        profile.contactNumber.trim()
                }
            );


            const updated =
                response.data || {};


            setProfile(previous => ({
                ...previous,
                id: updated.id ?? previous.id,
                name: updated.name ?? previous.name,
                email: updated.email ?? previous.email,
                role: updated.role ?? previous.role
            }));


            setMessage(
                "Profile updated successfully."
            );


        } catch (err) {

            console.error(
                "Failed to update profile:",
                err
            );


            setError(
                err.response?.data ||
                "Unable to update profile."
            );

        } finally {

            setSaving(false);
        }
    };


    // =====================================================
    // PASSWORD INPUT CHANGE
    // =====================================================

    const handlePasswordChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setPasswordForm(previous => ({
            ...previous,
            [name]: value
        }));


        setPasswordMessage("");
        setPasswordError("");
    };


    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    const handleChangePassword = async (event) => {

        event.preventDefault();


        setPasswordMessage("");
        setPasswordError("");


        if (!passwordForm.currentPassword) {

            setPasswordError(
                "Current password is required."
            );

            return;
        }


        if (!passwordForm.newPassword) {

            setPasswordError(
                "New password is required."
            );

            return;
        }


        if (passwordForm.newPassword.length < 6) {

            setPasswordError(
                "New password must be at least 6 characters."
            );

            return;
        }


        if (
            passwordForm.newPassword !==
            passwordForm.confirmPassword
        ) {

            setPasswordError(
                "New passwords do not match."
            );

            return;
        }


        try {

            setChangingPassword(true);


            await API.put(
                `/users/${userId}/change-password`,
                {
                    currentPassword:
                        passwordForm.currentPassword,

                    newPassword:
                        passwordForm.newPassword
                }
            );


            setPasswordMessage(
                "Password changed successfully."
            );


            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });


        } catch (err) {

            console.error(
                "Failed to change password:",
                err
            );


            setPasswordError(
                err.response?.data ||
                "Unable to change password."
            );

        } finally {

            setChangingPassword(false);
        }
    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("user");


        navigate("/login", {
            replace: true
        });
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="profile-loading">

                <div className="profile-loading-card">

                    <div className="profile-spinner"></div>

                    <h2>
                        Loading Profile...
                    </h2>

                    <p>
                        Please wait.
                    </p>

                </div>

            </div>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error && !profile.email) {

        return (
            <div className="profile-page">

                <div className="profile-error-card">

                    <div className="profile-error-icon">
                        !
                    </div>

                    <h2>
                        Unable to Load Profile
                    </h2>

                    <p>
                        {error}
                    </p>


                    <div className="profile-error-actions">

                        <button
                            className="profile-primary-button"
                            onClick={loadProfile}
                        >
                            Try Again
                        </button>


                        <button
                            className="profile-secondary-button"
                            onClick={() =>
                                navigate(
                                    "/candidate-dashboard"
                                )
                            }
                        >
                            Back to Dashboard
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // PROFILE PAGE
    // =====================================================

    return (
        <div className="profile-page">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="profile-header">

                <div>

                    <span className="profile-eyebrow">
                        ACCOUNT
                    </span>

                    <h1>
                        My Profile
                    </h1>

                    <p>
                        Manage your personal account
                        information and security.
                    </p>

                </div>


                <button
                    className="profile-dashboard-button"
                    onClick={() =>
                        navigate(
                            "/candidate-dashboard"
                        )
                    }
                >
                    ← Dashboard
                </button>

            </div>


            {/* =================================================
                PROFILE CONTENT
            ================================================= */}

            <div className="profile-grid">


                {/* =================================================
                    PERSONAL INFORMATION
                ================================================= */}

                <section className="profile-card">

                    <div className="profile-card-header">

                        <div className="profile-card-icon">
                            👤
                        </div>

                        <div>

                            <h2>
                                Personal Information
                            </h2>

                            <p>
                                Update your basic account details.
                            </p>

                        </div>

                    </div>


                    <form
                        onSubmit={handleSaveProfile}
                        className="profile-form"
                    >


                        {/* NAME */}

                        <div className="profile-field">

                            <label htmlFor="name">
                                Full Name
                            </label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={profile.name}
                                onChange={handleProfileChange}
                                placeholder="Enter your full name"
                                autoComplete="name"
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="profile-field">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={profile.email}
                                disabled
                            />

                            <small>
                                Email address cannot be changed
                                from this page.
                            </small>

                        </div>


                        {/* ROLE */}

                        <div className="profile-field">

                            <label htmlFor="role">
                                Account Role
                            </label>

                            <input
                                id="role"
                                type="text"
                                value={formatRole(
                                    profile.role
                                )}
                                disabled
                            />

                        </div>


                        {/* CONTACT */}

                        <div className="profile-field">

                            <label htmlFor="contactNumber">
                                Contact Number
                            </label>

                            <input
                                id="contactNumber"
                                name="contactNumber"
                                type="tel"
                                value={
                                    profile.contactNumber
                                }
                                onChange={
                                    handleProfileChange
                                }
                                placeholder="Enter your contact number"
                                autoComplete="tel"
                            />

                        </div>


                        {/* MESSAGE */}

                        {message && (

                            <div className="profile-success-message">
                                ✓ {message}
                            </div>

                        )}


                        {error && (

                            <div className="profile-error-message">
                                {error}
                            </div>

                        )}


                        {/* SAVE */}

                        <button
                            type="submit"
                            className="profile-save-button"
                            disabled={saving}
                        >

                            {saving
                                ? "Saving..."
                                : "Save Changes"}

                        </button>

                    </form>

                </section>


                {/* =================================================
                    ACCOUNT SUMMARY
                ================================================= */}

                <section className="profile-card">

                    <div className="profile-card-header">

                        <div className="profile-card-icon">
                            🔐
                        </div>

                        <div>

                            <h2>
                                Account
                            </h2>

                            <p>
                                Manage your account and security.
                            </p>

                        </div>

                    </div>


                    <div className="account-summary">


                        <div className="account-summary-row">

                            <span>
                                User ID
                            </span>

                            <strong>
                                #{profile.id || userId}
                            </strong>

                        </div>


                        <div className="account-summary-row">

                            <span>
                                Role
                            </span>

                            <strong>
                                {formatRole(
                                    profile.role
                                )}
                            </strong>

                        </div>


                        <div className="account-summary-row">

                            <span>
                                Email
                            </span>

                            <strong className="account-email">
                                {profile.email}
                            </strong>

                        </div>


                    </div>


                    <div className="profile-divider"></div>


                    {/* RESUME */}

                    <div className="profile-action-box">

                        <div>

                            <span className="profile-action-icon">
                                📄
                            </span>

                            <div>

                                <h3>
                                    Resume
                                </h3>

                                <p>
                                    View and manage your resume.
                                </p>

                            </div>

                        </div>


                        <button
                            onClick={() =>
                                navigate("/resume")
                            }
                        >
                            Open Resume
                        </button>

                    </div>


                    {/* LOGOUT */}

                    <div className="profile-action-box danger">

                        <div>

                            <span className="profile-action-icon">
                                🚪
                            </span>

                            <div>

                                <h3>
                                    Sign Out
                                </h3>

                                <p>
                                    Sign out of your Job Portal account.
                                </p>

                            </div>

                        </div>


                        <button
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </section>


                {/* =================================================
                    CHANGE PASSWORD
                ================================================= */}

                <section className="profile-card password-card">

                    <div className="profile-card-header">

                        <div className="profile-card-icon">
                            🔑
                        </div>

                        <div>

                            <h2>
                                Change Password
                            </h2>

                            <p>
                                Keep your account secure with
                                a strong password.
                            </p>

                        </div>

                    </div>


                    <form
                        onSubmit={handleChangePassword}
                        className="profile-form"
                    >


                        <div className="profile-field">

                            <label htmlFor="currentPassword">
                                Current Password
                            </label>

                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                value={
                                    passwordForm.currentPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                placeholder="Enter current password"
                                autoComplete="current-password"
                            />

                        </div>


                        <div className="profile-field">

                            <label htmlFor="newPassword">
                                New Password
                            </label>

                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={
                                    passwordForm.newPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                placeholder="Minimum 6 characters"
                                autoComplete="new-password"
                            />

                        </div>


                        <div className="profile-field">

                            <label htmlFor="confirmPassword">
                                Confirm New Password
                            </label>

                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={
                                    passwordForm.confirmPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                placeholder="Re-enter new password"
                                autoComplete="new-password"
                            />

                        </div>


                        {passwordMessage && (

                            <div className="profile-success-message">
                                ✓ {passwordMessage}
                            </div>

                        )}


                        {passwordError && (

                            <div className="profile-error-message">
                                {passwordError}
                            </div>

                        )}


                        <button
                            type="submit"
                            className="profile-save-button password-button"
                            disabled={
                                changingPassword
                            }
                        >

                            {changingPassword
                                ? "Changing Password..."
                                : "Change Password"}

                        </button>

                    </form>

                </section>

            </div>

        </div>
    );
}

export default Profile;