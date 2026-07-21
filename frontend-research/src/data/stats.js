/**
 * Mock statistics data for the Home page
 * TODO: Replace with API calls to backend when available
 */

export const homeStats = [
  {
    id: 1,
    value: '12,480',
    label: 'PUBLICATIONS',
  },
  {
    id: 2,
    value: '1,860',
    label: 'SUPERVISORS',
  },
  {
    id: 3,
    value: '17',
    label: 'DISCIPLINES',
  },
];

export const dashboardStats = {
  student: {
    totalSubmissions: 12,
    pendingReview: 3,
    approved: 8,
    rejected: 1,
  },
  supervisor: {
    assignedPapers: 24,
    pendingReview: 8,
    reviewed: 16,
    avgReviewTime: '3.2 days',
  },
  admin: {
    totalUsers: 2450,
    totalPublications: 12480,
    totalDepartments: 17,
    totalCategories: 42,
    pendingApprovals: 34,
    activeStudents: 1860,
  },
};

export default homeStats;
