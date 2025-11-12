import api from "./api";

// Fetch all users
export const getAllUsers = async () => {
  const response = await api.get("admin/users/");
  return response.data;
};

// Toggle user status (active/inactive)
export const toggleUserStatus = async (userId) => {
  const response = await api.patch(`admin/users/${userId}/status/`);
  return response.data;
};

// Update user role
export const updateUserRole = async (userId, newRole) => {
  const response = await api.patch(`admin/users/${userId}/role/`, { role: newRole });
  return response.data;
};

// Get dashboard stats
export const getDashboardStats = async () => {
  const response = await api.get("admin/stats/");
  return response.data;
};
