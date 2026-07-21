/**
 * Mock user data
 * TODO: Replace with API calls to backend when available
 */

export const users = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@university.edu',
    role: 'student',
    department: 'Computer Science',
    avatar: null,
    joinedDate: '2025-09-01',
    status: 'active',
  },
  {
    id: 2,
    name: 'Dr. Sarah Williams',
    email: 'sarah.williams@university.edu',
    role: 'supervisor',
    department: 'Medicine',
    avatar: null,
    joinedDate: '2020-01-15',
    status: 'active',
  },
  {
    id: 3,
    name: 'Admin User',
    email: 'admin@university.edu',
    role: 'admin',
    department: 'Administration',
    avatar: null,
    joinedDate: '2019-06-01',
    status: 'active',
  },
];

export const departments = [
  { id: 1, name: 'Computer Science', code: 'CS', studentCount: 450, supervisorCount: 28 },
  { id: 2, name: 'Medicine', code: 'MED', studentCount: 380, supervisorCount: 35 },
  { id: 3, name: 'Statistics', code: 'STAT', studentCount: 210, supervisorCount: 15 },
  { id: 4, name: 'Physics', code: 'PHY', studentCount: 190, supervisorCount: 18 },
  { id: 5, name: 'Biology', code: 'BIO', studentCount: 320, supervisorCount: 22 },
  { id: 6, name: 'Mathematics', code: 'MATH', studentCount: 175, supervisorCount: 14 },
  { id: 7, name: 'Chemistry', code: 'CHEM', studentCount: 160, supervisorCount: 12 },
];

export const categories = [
  { id: 1, name: 'Artificial Intelligence', department: 'Computer Science', publicationCount: 245 },
  { id: 2, name: 'Machine Learning', department: 'Computer Science', publicationCount: 198 },
  { id: 3, name: 'Medical Imaging', department: 'Medicine', publicationCount: 156 },
  { id: 4, name: 'Biostatistics', department: 'Statistics', publicationCount: 89 },
  { id: 5, name: 'Quantum Physics', department: 'Physics', publicationCount: 72 },
  { id: 6, name: 'Genomics', department: 'Biology', publicationCount: 134 },
];

export const notifications = [
  {
    id: 1,
    type: 'success',
    message: 'Your paper "Transformer-Based Approaches" has been approved.',
    date: '2026-07-19',
    read: false,
  },
  {
    id: 2,
    type: 'info',
    message: 'New feedback received on your submission.',
    date: '2026-07-18',
    read: false,
  },
  {
    id: 3,
    type: 'warning',
    message: 'Your paper revision is due in 3 days.',
    date: '2026-07-17',
    read: true,
  },
];

export default users;
