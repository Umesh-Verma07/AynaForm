import api from "./api";

// Get all forms for the authenticated user
export const getForms = () => api.get("/forms");
// Get a single form by ID
export const getForm = (id) => api.get(`/forms/${id}`);
// Create a new form
export const createForm = (data) => api.post("/forms", data);
// Update a form by ID
export const updateForm = (id, data) => api.put(`/forms/${id}`, data);
// Delete a form by ID
export const deleteForm = (id) => api.delete(`/forms/${id}`);
// Get all responses for a form
export const getResponses = (id) => api.get(`/forms/${id}/responses`);
// Get a summary of responses for a form
export const getSummary = (id) => api.get(`/forms/${id}/summary`);
// Export responses for a form as CSV (returns a blob)
export const exportCSV = (id) =>
  api.get(`/forms/${id}/export`, { responseType: "blob" });
// Submit a response to a form
export const submitResponse = (id, answers) =>
  api.post(`/forms/${id}/responses`, { answers });
// Delete all responses for a specific question in a form
export const deleteQuestionResponses = (formId, questionId) =>
  api.delete(`/forms/${formId}/questions/${questionId}/responses`); 