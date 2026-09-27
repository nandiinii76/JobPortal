import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function EditInterview() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [interview, setInterview] = useState(null);

    const [formData, setFormData] = useState({
        interviewDate: "",
        interviewTime: "",
        interviewMode: "ONLINE",
        meetingLink: "",
        location: "",
        interviewerName: "",
        interviewerEmail: "",
        notes: "",
        status: "SCHEDULED"
    });

    // =====================================================
    // LOAD INTERVIEW
    // =====================================================

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token) {
            alert("Please login first.");
            navigate("/login");
            return;
        }

        if (role !== "ROLE_EMPLOYER") {
            alert("Only employers can edit interviews.");
            navigate("/dashboard");
            return;
        }

        loadInterview();
    }, [id, navigate]);

    // =====================================================
    // GET INTERVIEW
    // =====================================================

    const loadInterview = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get(
                `/interviews/${id}`
            );

            console.log(
                "INTERVIEW:",
                response.data
            );

            const data = response.data;

            setInterview(data);

            setFormData({
                interviewDate:
                    data.interviewDate || "",

                interviewTime:
                    data.interviewTime
                        ? data.interviewTime.substring(0, 5)
                        : "",

                interviewMode:
                    data.interviewMode?.toUpperCase() ||
                    "ONLINE",

                meetingLink:
                    data.meetingLink || "",

                location:
                    data.location || "",

                interviewerName:
                    data.interviewerName || "",

                interviewerEmail:
                    data.interviewerEmail || "",

                notes:
                    data.notes || "",

                status:
                    data.status?.toUpperCase() ||
                    "SCHEDULED"
            });

        } catch (error) {
            console.error(
                "LOAD INTERVIEW ERROR:",
                error
            );

            if (error.response) {
                setError(
                    error.response.data?.message ||
                    error.response.data ||
                    "Failed to load interview."
                );
            } else {
                setError(
                    "Server is not responding."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // HANDLE INPUT
    // =====================================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
    };

    // =====================================================
    // MODE CHANGE
    // =====================================================

    const handleModeChange = (event) => {
        const mode = event.target.value;

        setFormData((previous) => ({
            ...previous,
            interviewMode: mode,

            meetingLink:
                mode === "ONLINE"
                    ? previous.meetingLink
                    : "",

            location:
                mode === "OFFLINE"
                    ? previous.location
                    : ""
        }));

        setError("");
    };

    // =====================================================
    // VALIDATE
    // =====================================================

    const validateForm = () => {

        if (!formData.interviewDate) {
            return "Interview date is required.";
        }

        if (!formData.interviewTime) {
            return "Interview time is required.";
        }

        if (!formData.interviewMode) {
            return "Interview mode is required.";
        }

        if (!formData.interviewerName.trim()) {
            return "Interviewer name is required.";
        }

        if (
            formData.interviewMode === "ONLINE" &&
            !formData.meetingLink.trim()
        ) {
            return "Meeting link is required for online interviews.";
        }

        if (
            formData.interviewMode === "OFFLINE" &&
            !formData.location.trim()
        ) {
            return "Interview location is required for offline interviews.";
        }

        if (formData.interviewerEmail.trim()) {

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                !emailRegex.test(
                    formData.interviewerEmail.trim()
                )
            ) {
                return "Please enter a valid interviewer email.";
            }
        }

        if (
            ![
                "SCHEDULED",
                "COMPLETED",
                "CANCELLED"
            ].includes(formData.status)
        ) {
            return "Invalid interview status.";
        }

        return "";
    };

    // =====================================================
    // UPDATE INTERVIEW
    // =====================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {

            setSaving(true);
            setError("");

            const payload = {

                interviewDate:
                    formData.interviewDate,

                interviewTime:
                    formData.interviewTime,

                interviewMode:
                    formData.interviewMode,

                meetingLink:
                    formData.interviewMode === "ONLINE"
                        ? formData.meetingLink.trim()
                        : null,

                location:
                    formData.interviewMode === "OFFLINE"
                        ? formData.location.trim()
                        : null,

                interviewerName:
                    formData.interviewerName.trim(),

                interviewerEmail:
                    formData.interviewerEmail.trim()
                        ? formData.interviewerEmail.trim()
                        : null,

                notes:
                    formData.notes.trim()
                        ? formData.notes.trim()
                        : null,

                status:
                    formData.status
            };

            console.log(
                "UPDATING INTERVIEW:",
                payload
            );

            const response = await API.put(
                `/interviews/${id}`,
                payload
            );

            console.log(
                "UPDATED INTERVIEW:",
                response.data
            );

            alert(
                "Interview updated successfully."
            );

            navigate("/manage-interviews");

        } catch (error) {

            console.error(
                "UPDATE INTERVIEW ERROR:",
                error
            );

            if (error.response) {

                console.error(
                    "STATUS:",
                    error.response.status
                );

                console.error(
                    "RESPONSE:",
                    error.response.data
                );

                setError(
                    error.response.data?.message ||
                    error.response.data ||
                    "Failed to update interview."
                );

            } else {

                setError(
                    "Server is not responding."
                );
            }

        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="
                min-h-screen
                bg-gray-100
                flex
                items-center
                justify-center
            ">

                <div className="
                    bg-white
                    rounded-xl
                    shadow-md
                    p-10
                    text-center
                ">

                    <div className="
                        text-5xl
                        mb-4
                    ">
                        ✏️
                    </div>

                    <h2 className="
                        text-2xl
                        font-bold
                        text-gray-800
                    ">
                        Loading Interview...
                    </h2>

                    <p className="
                        text-gray-500
                        mt-2
                    ">
                        Please wait.
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // ERROR / NOT FOUND
    // =====================================================

    if (!interview && error) {

        return (
            <div className="
                min-h-screen
                bg-gray-100
                flex
                items-center
                justify-center
                p-6
            ">

                <div className="
                    bg-white
                    rounded-xl
                    shadow-md
                    p-10
                    max-w-lg
                    w-full
                    text-center
                ">

                    <div className="
                        text-5xl
                        mb-4
                    ">
                        ⚠️
                    </div>

                    <h2 className="
                        text-2xl
                        font-bold
                        text-gray-800
                    ">
                        Unable to Load Interview
                    </h2>

                    <p className="
                        text-red-600
                        mt-4
                    ">
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                "/manage-interviews"
                            )
                        }
                        className="
                            mt-6
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            px-6
                            py-3
                            rounded-lg
                            font-semibold
                        "
                    >
                        Back to Interviews
                    </button>

                </div>

            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="
            min-h-screen
            bg-gray-100
            py-10
            px-6
        ">

            <div className="
                max-w-4xl
                mx-auto
            ">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-8">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/manage-interviews"
                            )
                        }
                        className="
                            text-blue-600
                            hover:text-blue-800
                            font-semibold
                            mb-4
                        "
                    >
                        ← Back to Interviews
                    </button>

                    <h1 className="
                        text-4xl
                        font-bold
                        text-gray-900
                    ">
                        Edit Interview
                    </h1>

                    <p className="
                        text-gray-600
                        mt-2
                    ">
                        Update the interview schedule and details.
                    </p>

                </div>

                {/* =================================================
                    APPLICATION SUMMARY
                ================================================= */}

                {interview.application && (

                    <div className="
                        bg-white
                        rounded-xl
                        shadow-md
                        p-6
                        mb-6
                    ">

                        <h2 className="
                            text-xl
                            font-bold
                            text-gray-800
                            mb-4
                        ">
                            Interview For
                        </h2>

                        <div className="
                            grid
                            grid-cols-1
                            md:grid-cols-3
                            gap-4
                        ">

                            <div>

                                <p className="
                                    text-sm
                                    text-gray-500
                                ">
                                    Candidate
                                </p>

                                <p className="
                                    font-semibold
                                    text-gray-900
                                ">
                                    {
                                        interview.application.user?.name ||
                                        "N/A"
                                    }
                                </p>

                            </div>

                            <div>

                                <p className="
                                    text-sm
                                    text-gray-500
                                ">
                                    Job
                                </p>

                                <p className="
                                    font-semibold
                                    text-blue-600
                                ">
                                    {
                                        interview.application.job?.title ||
                                        "N/A"
                                    }
                                </p>

                            </div>

                            <div>

                                <p className="
                                    text-sm
                                    text-gray-500
                                ">
                                    Application ID
                                </p>

                                <p className="
                                    font-semibold
                                    text-gray-900
                                ">
                                    #
                                    {
                                        interview.application.id ||
                                        "N/A"
                                    }
                                </p>

                            </div>

                        </div>

                    </div>
                )}

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="
                        bg-red-100
                        border
                        border-red-300
                        text-red-700
                        rounded-lg
                        px-5
                        py-4
                        mb-6
                    ">

                        <strong>
                            Error:
                        </strong>{" "}
                        {error}

                    </div>
                )}

                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    onSubmit={handleSubmit}
                    className="
                        bg-white
                        rounded-xl
                        shadow-md
                        p-8
                    "
                >

                    <div className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-6
                    ">

                        {/* DATE */}

                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-gray-700
                                mb-2
                            ">
                                Interview Date *
                            </label>

                            <input
                                type="date"
                                name="interviewDate"
                                value={
                                    formData.interviewDate
                                }
                                onChange={
                                    handleChange
                                }
                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded-lg
                                    px-4
                                    py-3
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                "
                            />

                        </div>

                        {/* TIME */}

                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-gray-700
                                mb-2
                            ">
                                Interview Time *
                            </label>

                            <input
                                type="time"
                                name="interviewTime"
                                value={
                                    formData.interviewTime
                                }
                                onChange={
                                    handleChange
                                }
                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded-lg
                                    px-4
                                    py-3
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                "
                            />

                        </div>

                        {/* MODE */}

                        <div className="md:col-span-2">

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-gray-700
                                mb-2
                            ">
                                Interview Mode *
                            </label>

                            <select
                                name="interviewMode"
                                value={
                                    formData.interviewMode
                                }
                                onChange={
                                    handleModeChange
                                }
                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded-lg
                                    px-4
                                    py-3
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                "
                            >

                                <option value="ONLINE">
                                    Online
                                </option>

                                <option value="OFFLINE">
                                    Offline
                                </option>

                            </select>

                        </div>

                        {/* ONLINE */}

                        {formData.interviewMode ===
                            "ONLINE" && (

                            <div className="md:col-span-2">

                                <label className="
                                    block
                                    text-sm
                                    font-semibold
                                    text-gray-700
                                    mb-2
                                ">
                                    Meeting Link *
                                </label>

                                <input
                                    type="url"
                                    name="meetingLink"
                                    value={
                                        formData.meetingLink
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="https://meet.google.com/..."
                                    className="
                                        w-full
                                        border
                                        border-gray-300
                                        rounded-lg
                                        px-4
                                        py-3
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-blue-500
                                    "
                                />

                            </div>
                        )}

                        {/* OFFLINE */}

                        {formData.interviewMode ===
                            "OFFLINE" && (

                            <div className="md:col-span-2">

                                <label className="
                                    block
                                    text-sm
                                    font-semibold
                                    text-gray-700
                                    mb-2
                                ">
                                    Interview Location *
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    value={
                                        formData.location
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Office / meeting room"
                                    className="
                                        w-full
                                        border
                                        border-gray-300
                                        rounded-lg
                                        px-4
                                        py-3
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-blue-500
                                    "
                                />

                            </div>
                        )}

                        {/* INTERVIEWER */}

                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-gray-700
                                mb-2
                            ">
                                Interviewer Name *
                            </label>

                            <input
                                type="text"
                                name="interviewerName"
                                value={
                                    formData.interviewerName
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter interviewer name"
                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded-lg
                                    px-4
                                    py-3
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                "
                            />

                        </div>

                        {/* INTERVIEWER EMAIL */}

                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-gray-700
                                mb-2
                            ">
                                Interviewer Email
                            </label>

                            <input
                                type="email"
                                name="interviewerEmail"
                                value={
                                    formData.interviewerEmail
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="interviewer@company.com"
                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded-lg
                                    px-4
                                    py-3
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                "
                            />

                        </div>

                        {/* STATUS */}

                        <div className="md:col-span-2">

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-gray-700
                                mb-2
                            ">
                                Interview Status
                            </label>

                            <select
                                name="status"
                                value={
                                    formData.status
                                }
                                onChange={
                                    handleChange
                                }
                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded-lg
                                    px-4
                                    py-3
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                "
                            >

                                <option value="SCHEDULED">
                                    Scheduled
                                </option>

                                <option value="COMPLETED">
                                    Completed
                                </option>

                                <option value="CANCELLED">
                                    Cancelled
                                </option>

                            </select>

                        </div>

                        {/* NOTES */}

                        <div className="md:col-span-2">

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-gray-700
                                mb-2
                            ">
                                Interview Notes
                            </label>

                            <textarea
                                name="notes"
                                value={
                                    formData.notes
                                }
                                onChange={
                                    handleChange
                                }
                                rows="5"
                                placeholder="Add interview notes..."
                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded-lg
                                    px-4
                                    py-3
                                    resize-none
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                "
                            />

                        </div>

                    </div>

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <div className="
                        flex
                        flex-col
                        sm:flex-row
                        gap-4
                        mt-8
                        pt-6
                        border-t
                    ">

                        <button
                            type="submit"
                            disabled={saving}
                            className="
                                flex-1
                                bg-blue-600
                                hover:bg-blue-700
                                disabled:bg-gray-400
                                text-white
                                px-6
                                py-3
                                rounded-lg
                                font-semibold
                                transition
                            "
                        >
                            {saving
                                ? "Saving Changes..."
                                : "💾 Save Changes"}
                        </button>

                        <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                                navigate(
                                    "/manage-interviews"
                                )
                            }
                            className="
                                flex-1
                                bg-gray-200
                                hover:bg-gray-300
                                disabled:bg-gray-400
                                text-gray-800
                                px-6
                                py-3
                                rounded-lg
                                font-semibold
                                transition
                            "
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default EditInterview;