import API from "./api";

const InterviewService = {

    scheduleInterview(applicationId, interview) {
        return API.post(`/interviews/${applicationId}`, interview);
    },

    getCandidateInterviews(userId) {
        return API.get(`/interviews/candidate/${userId}`);
    },

    getEmployerInterviews(employerId) {
        return API.get(`/interviews/employer/${employerId}`);
    },

    updateInterview(id, interview) {
        return API.put(`/interviews/${id}`, interview);
    },

    updateStatus(id, status) {
        return API.put(`/interviews/${id}/status?status=${status}`);
    },

    cancelInterview(id) {
        return API.put(`/interviews/${id}/cancel`);
    },

    completeInterview(id) {
        return API.put(`/interviews/${id}/complete`);
    },

    deleteInterview(id) {
        return API.delete(`/interviews/${id}`);
    }

};

export default InterviewService;