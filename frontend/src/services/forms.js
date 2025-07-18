import api from "./api";

export const getForms = () => api.get("/forms");
export const getForm = (id) => api.get(`/forms/${id}`);
export const createForm = (data) => api.post("/forms", data);
export const updateForm = (id, data) => api.put(`/forms/${id}`, data);
export const deleteForm = (id) => api.delete(`/forms/${id}`);
export const getResponses = (id) => api.get(`/forms/${id}/responses`);
export const getSummary = (id) => api.get(`/forms/${id}/summary`);
export const exportCSV = (id) =>
  api.get(`/forms/${id}/export`, { responseType: "blob" });
export const submitResponse = (id, answers) =>
  api.post(`/forms/${id}/responses`, { answers });
export const deleteQuestionResponses = (formId, questionId) =>
  api.delete(`/forms/${formId}/questions/${questionId}/responses`); 