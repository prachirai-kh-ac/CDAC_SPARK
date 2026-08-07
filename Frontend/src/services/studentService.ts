import api from './api'

export const studentService = {
  getDashboard: async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) return { success: false, data: null };

      const res = await api.get(`/result/student/${user.id || user.userId}/dashboard`);
      
      return {
        success: true,
        data: res.data.data
      };
    } catch (err) {
      console.error(err);
      return { success: false, data: null };
    }
  },

  getProfile: async () => {
    const res = await api.get('/auth/profile')
    return res.data
  },

  updateProfile: async (data: any) => {
    // const res = await api.put('/auth/profile', data)
    return {}
  },

  getAttemptHistory: async () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) return { success: false, data: [] };
    
    try {
      const [res, examsRes] = await Promise.all([
        api.get(`/result/student/${user.userId || user.id}/results`),
        api.get('/exams')
      ]);
      
      const resultsData = res.data?.data || [];
      const examsData = examsRes.data?.data || examsRes.data || [];
      
      const enrichedResults = resultsData
        .filter((result: any) => examsData.some((e: any) => Number(e.id || e.examId) === Number(result.examId)))
        .map((result: any) => {
          const matchingExam = examsData.find((e: any) => Number(e.id || e.examId) === Number(result.examId));
          const statusStr = matchingExam?.status || '';
          const isPublished = statusStr.equalsIgnoreCase ? statusStr.equalsIgnoreCase('Published') : String(statusStr).toLowerCase() === 'published';
          return {
            ...result,
            examTitle: matchingExam?.title || matchingExam?.examName,
            batchName: matchingExam?.moduleName || 'General',
            examStatus: statusStr,
            isPublished: isPublished
          };
        });
      
      return { success: true, data: enrichedResults };
    } catch (error) {
      console.error(error);
      return { success: false, data: [] };
    }
  },

  getLiveExams: async () => {
    try {
      const res = await api.get('/student/exams/live')
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, data: [] }
    }
  },

  getUpcomingExams: async () => {
    try {
      const res = await api.get('/student/exams/upcoming')
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, data: [] }
    }
  },

  getLeaderboard: async (batchName?: string) => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      // If batchName isn't provided, optionally fall back to user's batch
      const queryBatch = batchName || user?.batchName || '';
      
      const res = await api.get('/result/leaderboard', { params: { batchName: queryBatch } });
      return res.data;
    } catch (error) {
      console.error(error);
      return { success: false, data: [] };
    }
  },
}