import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Créer l'instance axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types de réponse
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==================== AUTH ====================
export const authAPI = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<ApiResponse>('/auth/login', { email, password });
    return data;
  },

  register: async (userData: any) => {
    const { data } = await api.post<ApiResponse>('/auth/register', userData);
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get<ApiResponse>('/auth/me');
    return data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const { data } = await api.post<ApiResponse>('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return data;
  },
};

// ==================== USERS ====================
export const usersAPI = {
  getAll: async (params?: { school_id?: string; role?: string }) => {
    const { data } = await api.get<ApiResponse>('/users', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse>(`/users/${id}`);
    return data;
  },

  create: async (userData: any) => {
    const { data } = await api.post<ApiResponse>('/users', userData);
    return data;
  },

  update: async (id: string, userData: any) => {
    const { data } = await api.put<ApiResponse>(`/users/${id}`, userData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse>(`/users/${id}`);
    return data;
  },
};

// ==================== SCHOOLS ====================
export const schoolsAPI = {
  getAll: async () => {
    const { data } = await api.get<ApiResponse>('/schools');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse>(`/schools/${id}`);
    return data;
  },

  create: async (schoolData: any) => {
    const { data } = await api.post<ApiResponse>('/schools', schoolData);
    return data;
  },

  update: async (id: string, schoolData: any) => {
    const { data } = await api.put<ApiResponse>(`/schools/${id}`, schoolData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse>(`/schools/${id}`);
    return data;
  },
};

// ==================== STUDENTS ====================
export const studentsAPI = {
  getAll: async (params?: { school_id?: string; class_id?: string }) => {
    const { data } = await api.get<ApiResponse>('/students', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse>(`/students/${id}`);
    return data;
  },

  create: async (studentData: any) => {
    const { data } = await api.post<ApiResponse>('/students', studentData);
    return data;
  },

  update: async (id: string, studentData: any) => {
    const { data } = await api.put<ApiResponse>(`/students/${id}`, studentData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse>(`/students/${id}`);
    return data;
  },
};

// ==================== TEACHERS ====================
export const teachersAPI = {
  getAll: async (params?: { school_id?: string }) => {
    const { data } = await api.get<ApiResponse>('/teachers', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse>(`/teachers/${id}`);
    return data;
  },

  create: async (teacherData: any) => {
    const { data } = await api.post<ApiResponse>('/teachers', teacherData);
    return data;
  },

  update: async (id: string, teacherData: any) => {
    const { data } = await api.put<ApiResponse>(`/teachers/${id}`, teacherData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse>(`/teachers/${id}`);
    return data;
  },

  getSubjects: async (id: string) => {
    const { data } = await api.get<ApiResponse>(`/teachers/${id}/subjects`);
    return data;
  },
};

// ==================== CLASSES ====================
export const classesAPI = {
  getAll: async (params?: { school_id?: string }) => {
    const { data } = await api.get<ApiResponse>('/classes', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse>(`/classes/${id}`);
    return data;
  },

  create: async (classData: any) => {
    const { data } = await api.post<ApiResponse>('/classes', classData);
    return data;
  },

  update: async (id: string, classData: any) => {
    const { data } = await api.put<ApiResponse>(`/classes/${id}`, classData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse>(`/classes/${id}`);
    return data;
  },
};

// ==================== SUBJECTS ====================
export const subjectsAPI = {
  getAll: async () => {
    const { data } = await api.get<ApiResponse>('/subjects');
    return data;
  },

  create: async (subjectData: any) => {
    const { data } = await api.post<ApiResponse>('/subjects', subjectData);
    return data;
  },

  update: async (id: string, subjectData: any) => {
    const { data } = await api.put<ApiResponse>(`/subjects/${id}`, subjectData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse>(`/subjects/${id}`);
    return data;
  },
};

// ==================== GRADES ====================
export const gradesAPI = {
  getAll: async (params?: { student_id?: string; school_year_id?: string }) => {
    const { data } = await api.get<ApiResponse>('/grades', { params });
    return data;
  },

  create: async (gradeData: any) => {
    const { data } = await api.post<ApiResponse>('/grades', gradeData);
    return data;
  },

  update: async (id: string, gradeData: any) => {
    const { data } = await api.put<ApiResponse>(`/grades/${id}`, gradeData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse>(`/grades/${id}`);
    return data;
  },
};

// ==================== ATTENDANCE ====================
export const attendanceAPI = {
  getAll: async (params?: { class_id?: string; date?: string }) => {
    const { data } = await api.get<ApiResponse>('/attendance', { params });
    return data;
  },

  create: async (attendanceData: any) => {
    const { data } = await api.post<ApiResponse>('/attendance', attendanceData);
    return data;
  },

  update: async (id: string, attendanceData: any) => {
    const { data } = await api.put<ApiResponse>(`/attendance/${id}`, attendanceData);
    return data;
  },
};

// ==================== PAYMENTS ====================
export const paymentsAPI = {
  getAll: async (params?: { student_id?: string }) => {
    const { data } = await api.get<ApiResponse>('/payments', { params });
    return data;
  },

  create: async (paymentData: any) => {
    const { data } = await api.post<ApiResponse>('/payments', paymentData);
    return data;
  },

  getRevenue: async (schoolId: string, params?: { start_date?: string; end_date?: string }) => {
    const { data } = await api.get<ApiResponse>(`/payments/revenue/${schoolId}`, { params });
    return data;
  },
};

// ==================== NOTIFICATIONS ====================
export const notificationsAPI = {
  getAll: async () => {
    const { data } = await api.get<ApiResponse>('/notifications');
    return data;
  },

  create: async (notificationData: any) => {
    const { data } = await api.post<ApiResponse>('/notifications', notificationData);
    return data;
  },
};

// ==================== TIMETABLE ====================
export const timetableAPI = {
  getAll: async (params?: { class_id?: string; day_of_week?: string }) => {
    const { data } = await api.get<ApiResponse>('/timetable', { params });
    return data;
  },

  create: async (timetableData: any) => {
    const { data } = await api.post<ApiResponse>('/timetable', timetableData);
    return data;
  },

  update: async (id: string, timetableData: any) => {
    const { data } = await api.put<ApiResponse>(`/timetable/${id}`, timetableData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse>(`/timetable/${id}`);
    return data;
  },
};

// ==================== REPORTS ====================
export const reportsAPI = {
  getStudentStats: async (schoolId: string) => {
    const { data } = await api.get<ApiResponse>(`/reports/students/${schoolId}`);
    return data;
  },

  getAttendanceStats: async (schoolId: string, params?: { start_date?: string; end_date?: string }) => {
    const { data } = await api.get<ApiResponse>(`/reports/attendance/${schoolId}`, { params });
    return data;
  },

  getGradeStats: async (schoolId: string, params?: { school_year_id?: string }) => {
    const { data } = await api.get<ApiResponse>(`/reports/grades/${schoolId}`, { params });
    return data;
  },

  getPaymentStats: async (schoolId: string, params?: { start_date?: string; end_date?: string }) => {
    const { data } = await api.get<ApiResponse>(`/reports/payments/${schoolId}`, { params });
    return data;
  },

  getTeacherStats: async (schoolId: string) => {
    const { data } = await api.get<ApiResponse>(`/reports/teachers/${schoolId}`);
    return data;
  },

  getComprehensive: async (schoolId: string, params?: { school_year_id?: string }) => {
    const { data } = await api.get<ApiResponse>(`/reports/school/${schoolId}/comprehensive`, { params });
    return data;
  },
};

export default api;
