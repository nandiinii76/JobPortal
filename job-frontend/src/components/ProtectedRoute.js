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
    // NORMALIZE USER ROLE
    // ==========================================

    const normalizeRole = (value) => {

        if (!value) {
            return "";
        }

        let normalized = String(value)
            .trim()
            .toUpperCase();

        // --------------------------------------
        // Remove duplicate ROLE_ prefix
        // --------------------------------------

        if (normalized.startsWith("ROLE_ROLE_")) {
            normalized = normalized.substring(5);
        }

        // --------------------------------------
        // Convert aliases
        // --------------------------------------

        switch (normalized) {

            case "USER":
            case "ROLE_USER":

            case "CANDIDATE":
            case "ROLE_CANDIDATE":

            case "JOBSEEKER":
            case "JOB_SEEKER":
                return "ROLE_JOB_SEEKER";

            case "EMPLOYER":
                return "ROLE_EMPLOYER";

            case "RECRUITER":
                return "ROLE_RECRUITER";

            case "ADMIN":
                return "ROLE_ADMIN";

            default:

                // Already ROLE_XXX
                if (normalized.startsWith("ROLE_")) {
                    return normalized;
                }

                return `ROLE_${normalized}`;
        }
    };

    // ==========================================
    // NORMALIZED USER ROLE
    // ==========================================

    const userRole = normalizeRole(storedRole);

    console.log("ProtectedRoute:");
    console.log("Stored role:", storedRole);
    console.log("Normalized role:", userRole);

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
        .map((item) => normalizeRole(item))
        .filter(Boolean);

    console.log("Allowed roles:", allowedRoles);

    // ==========================================
    // ROLE VALIDATION
    // ==========================================

    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(userRole)
    ) {

        console.warn(
            "ProtectedRoute: role not allowed",
            {
                userRole,
                allowedRoles
            }
        );

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
                    to="/admin-dashboard"
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