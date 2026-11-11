import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role, roles }) {

    // ==========================================
    // GET LOGIN DATA
    // ==========================================

    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    // ==========================================
    // NOT LOGGED IN
    // ==========================================

    if (!token) {
        return <Navigate to="/login" replace />;
    }

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

        // ROLE_ROLE_EMPLOYER → ROLE_EMPLOYER
        while (normalized.startsWith("ROLE_ROLE_")) {
            normalized = normalized.substring(5);
        }

        // ======================================
        // JOB SEEKER ALIASES
        // ======================================

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

            // ==================================
            // EMPLOYER
            // ==================================

            case "EMPLOYER":
            case "ROLE_EMPLOYER":

                return "ROLE_EMPLOYER";

            // ==================================
            // RECRUITER
            // ==================================

            case "RECRUITER":
            case "ROLE_RECRUITER":

                return "ROLE_RECRUITER";

            // ==================================
            // ADMIN
            // ==================================

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
    // USER ROLE
    // ==========================================

    const userRole = normalizeRole(storedRole);

    // ==========================================
    // BUILD ALLOWED ROLES
    // ==========================================

    let allowedRoles = [];

    if (role) {
        allowedRoles.push(role);
    }

    if (roles && Array.isArray(roles)) {
        allowedRoles = [
            ...allowedRoles,
            ...roles
        ];
    }

    // ==========================================
    // NORMALIZE ALLOWED ROLES
    // ==========================================

    allowedRoles = allowedRoles
        .map(normalizeRole)
        .filter(Boolean);

    // ==========================================
    // ROLE VALIDATION
    // ==========================================

    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(userRole)
    ) {

        // ======================================
        // EMPLOYER
        // ======================================

        if (userRole === "ROLE_EMPLOYER") {
            return (
                <Navigate
                    to="/employer-dashboard"
                    replace
                />
            );
        }

        // ======================================
        // RECRUITER
        // ======================================

        if (userRole === "ROLE_RECRUITER") {
            return (
                <Navigate
                    to="/recruiter-dashboard"
                    replace
                />
            );
        }

        // ======================================
        // JOB SEEKER
        // ======================================

        if (userRole === "ROLE_JOB_SEEKER") {
            return (
                <Navigate
                    to="/candidate-dashboard"
                    replace
                />
            );
        }

        // ======================================
        // ADMIN
        // ======================================

        if (userRole === "ROLE_ADMIN") {
            return (
                <Navigate
                    to="/dashboard"
                    replace
                />
            );
        }

        // ======================================
        // UNKNOWN ROLE
        // ======================================

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // ==========================================
    // ACCESS GRANTED
    // ==========================================

    return children;
}

export default ProtectedRoute;