import { useEffect, useState } from "react";
import API from "../services/api";
import "./Resume.css";

function Resume() {

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const [resume, setResume] = useState({
        id: null,
        resumeUrl: "",
        skills: "",
        education: "",
        experience: "",
        phone: "",
        linkedin: "",
        github: ""
    });

    const [file, setFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ==========================================
    // LOAD RESUME
    // ==========================================

    useEffect(() => {

        if (!userId || !token) {
            setLoading(false);
            return;
        }

        loadResume();

    }, [userId, token]);

    const loadResume = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await API.get(
                `/resume/${userId}`
            );

            if (response.data) {

                setResume({
                    id: response.data.id || null,
                    resumeUrl: response.data.resumeUrl || "",
                    skills: response.data.skills || "",
                    education: response.data.education || "",
                    experience: response.data.experience || "",
                    phone: response.data.phone || "",
                    linkedin: response.data.linkedin || "",
                    github: response.data.github || ""
                });

            }

        } catch (err) {

            if (err.response?.status === 404) {

                setResume({
                    id: null,
                    resumeUrl: "",
                    skills: "",
                    education: "",
                    experience: "",
                    phone: "",
                    linkedin: "",
                    github: ""
                });

            } else {

                console.error(
                    "Failed to load resume:",
                    err
                );

                setError(
                    "Failed to load resume information."
                );
            }

        } finally {

            setLoading(false);

        }
    };

    // ==========================================
    // HANDLE FORM CHANGE
    // ==========================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setResume(prev => ({
            ...prev,
            [name]: value
        }));

    };

    // ==========================================
    // SAVE RESUME PROFILE
    // ==========================================

    const handleSave = async (e) => {

        e.preventDefault();

        if (!userId) {

            setError("User session not found.");

            return;
        }

        try {

            setSaving(true);
            setMessage("");
            setError("");

            const response = await API.post(
                `/resume?userId=${userId}`,
                {
                    skills: resume.skills,
                    education: resume.education,
                    experience: resume.experience,
                    phone: resume.phone,
                    linkedin: resume.linkedin,
                    github: resume.github
                }
            );

            setResume(prev => ({
                ...prev,
                id: response.data.id || prev.id,
                resumeUrl:
                    response.data.resumeUrl ||
                    prev.resumeUrl
            }));

            setMessage(
                "Resume information saved successfully."
            );

        } catch (err) {

            console.error(
                "Failed to save resume:",
                err
            );

            setError(
                err.response?.data ||
                "Failed to save resume information."
            );

        } finally {

            setSaving(false);

        }
    };

    // ==========================================
    // SELECT FILE
    // ==========================================

    const handleFileChange = (e) => {

        const selectedFile = e.target.files?.[0];

        setMessage("");
        setError("");

        if (!selectedFile) {

            setFile(null);

            return;
        }

        // PDF only

        if (
            selectedFile.type !==
            "application/pdf"
        ) {

            setError(
                "Only PDF files are allowed."
            );

            e.target.value = "";

            setFile(null);

            return;
        }

        // 5 MB maximum

        const maxSize =
            5 * 1024 * 1024;

        if (selectedFile.size > maxSize) {

            setError(
                "Resume must be smaller than 5 MB."
            );

            e.target.value = "";

            setFile(null);

            return;
        }

        setFile(selectedFile);

    };

    // ==========================================
    // UPLOAD RESUME
    // ==========================================

    const handleUpload = async () => {

        if (!file) {

            setError(
                "Please select a PDF resume first."
            );

            return;
        }

        if (!userId) {

            setError(
                "User session not found."
            );

            return;
        }

        try {

            setUploading(true);
            setMessage("");
            setError("");

            const formData = new FormData();

            formData.append(
                "file",
                file
            );

            const response = await API.post(
                `/resume/upload?userId=${userId}`,
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            setResume(prev => ({
                ...prev,
                id: response.data.id || prev.id,
                resumeUrl:
                    response.data.resumeUrl ||
                    prev.resumeUrl
            }));

            setMessage(
                "Resume uploaded successfully."
            );

            setFile(null);

            const fileInput =
                document.getElementById(
                    "resume-file"
                );

            if (fileInput) {
                fileInput.value = "";
            }

        } catch (err) {

            console.error(
                "Failed to upload resume:",
                err
            );

            setError(
                err.response?.data ||
                "Failed to upload resume."
            );

        } finally {

            setUploading(false);

        }
    };

    // ==========================================
    // DOWNLOAD RESUME
    // ==========================================

    const handleDownload = async () => {

        if (!resume.id) {

            setError(
                "No uploaded resume found."
            );

            return;
        }

        try {

            setError("");
            setMessage("");

            const response = await API.get(
                `/resume/download/${resume.id}?userId=${userId}`,
                {
                    responseType: "blob"
                }
            );

            const blob = new Blob(
                [response.data],
                {
                    type: "application/pdf"
                }
            );

            const url =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;
            link.download = "resume.pdf";

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (err) {

            console.error(
                "Failed to download resume:",
                err
            );

            setError(
                "Failed to download resume."
            );
        }
    };

    // ==========================================
    // DELETE RESUME
    // ==========================================

    const handleDelete = async () => {

        if (!window.confirm(
            "Are you sure you want to delete your resume?"
        )) {

            return;
        }

        try {

            setDeleting(true);
            setMessage("");
            setError("");

            await API.delete(
                `/resume/${userId}`
            );

            setResume({
                id: null,
                resumeUrl: "",
                skills: "",
                education: "",
                experience: "",
                phone: "",
                linkedin: "",
                github: ""
            });

            setFile(null);

            setMessage(
                "Resume deleted successfully."
            );

        } catch (err) {

            console.error(
                "Failed to delete resume:",
                err
            );

            setError(
                err.response?.data ||
                "Failed to delete resume."
            );

        } finally {

            setDeleting(false);

        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="resume-page">

                <div className="resume-container">

                    <div className="resume-loading">
                        Loading resume...
                    </div>

                </div>

            </div>
        );
    }

    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="resume-page">

            <div className="resume-container">

                {/* ==================================
                    HEADER
                ================================== */}

                <div className="resume-header">

                    <p className="resume-eyebrow">
                        Career Profile
                    </p>

                    <h1>
                        My Resume
                    </h1>

                    <p>
                        Manage your resume and
                        professional information.
                    </p>

                </div>

                {/* ==================================
                    MESSAGES
                ================================== */}

                {message && (

                    <div className="resume-success">
                        {message}
                    </div>

                )}

                {error && (

                    <div className="resume-error">
                        {error}
                    </div>

                )}

                {/* ==================================
                    RESUME PDF
                ================================== */}

                <section className="resume-card">

                    <div className="resume-card-header">

                        <div>

                            <h2>
                                Resume PDF
                            </h2>

                            <p>
                                Upload your latest
                                resume as a PDF.
                            </p>

                        </div>

                    </div>

                    <div className="resume-upload-area">

                        <label
                            htmlFor="resume-file"
                            className="resume-upload-label"
                        >
                            Choose Resume PDF
                        </label>

                        <input
                            id="resume-file"
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={handleFileChange}
                        />

                        <p className="resume-help">
                            PDF only · Maximum size 5 MB
                        </p>

                    </div>

                    {file && (

                        <div className="resume-selected-file">

                            <span>
                                Selected:
                                {" "}
                                {file.name}
                            </span>

                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={uploading}
                                className="resume-primary-button"
                            >
                                {uploading
                                    ? "Uploading..."
                                    : "Upload Resume"}
                            </button>

                        </div>

                    )}

                    {resume.id && (

                        <div className="resume-file-actions">

                            <button
                                type="button"
                                onClick={handleDownload}
                                className="resume-secondary-button"
                            >
                                Download Resume
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="resume-danger-button"
                            >
                                {deleting
                                    ? "Deleting..."
                                    : "Delete Resume"}
                            </button>

                        </div>

                    )}

                </section>

                {/* ==================================
                    PROFESSIONAL INFORMATION
                ================================== */}

                <section className="resume-card">

                    <div className="resume-card-header">

                        <div>

                            <h2>
                                Professional Information
                            </h2>

                            <p>
                                Keep your career details
                                up to date.
                            </p>

                        </div>

                    </div>

                    <form
                        onSubmit={handleSave}
                        className="resume-form"
                    >

                        {/* SKILLS */}

                        <div className="resume-field">

                            <label htmlFor="skills">
                                Skills
                            </label>

                            <textarea
                                id="skills"
                                name="skills"
                                value={resume.skills}
                                onChange={handleChange}
                                placeholder="Java, Spring Boot, React, SQL..."
                                rows="4"
                            />

                        </div>

                        {/* EDUCATION */}

                        <div className="resume-field">

                            <label htmlFor="education">
                                Education
                            </label>

                            <textarea
                                id="education"
                                name="education"
                                value={resume.education}
                                onChange={handleChange}
                                placeholder="B.Tech in Computer Science..."
                                rows="4"
                            />

                        </div>

                        {/* EXPERIENCE */}

                        <div className="resume-field">

                            <label htmlFor="experience">
                                Experience
                            </label>

                            <textarea
                                id="experience"
                                name="experience"
                                value={resume.experience}
                                onChange={handleChange}
                                placeholder="Internships, projects, work experience..."
                                rows="5"
                            />

                        </div>

                        {/* PHONE */}

                        <div className="resume-field">

                            <label htmlFor="phone">
                                Phone
                            </label>

                            <input
                                id="phone"
                                type="text"
                                name="phone"
                                value={resume.phone}
                                onChange={handleChange}
                                placeholder="Phone number"
                            />

                        </div>

                        {/* LINKEDIN */}

                        <div className="resume-field">

                            <label htmlFor="linkedin">
                                LinkedIn
                            </label>

                            <input
                                id="linkedin"
                                type="url"
                                name="linkedin"
                                value={resume.linkedin}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/..."
                            />

                        </div>

                        {/* GITHUB */}

                        <div className="resume-field">

                            <label htmlFor="github">
                                GitHub
                            </label>

                            <input
                                id="github"
                                type="url"
                                name="github"
                                value={resume.github}
                                onChange={handleChange}
                                placeholder="https://github.com/..."
                            />

                        </div>

                        {/* SAVE */}

                        <button
                            type="submit"
                            disabled={saving}
                            className="resume-primary-button"
                        >
                            {saving
                                ? "Saving..."
                                : "Save Information"}
                        </button>

                    </form>

                </section>

            </div>

        </div>
    );
}

export default Resume;