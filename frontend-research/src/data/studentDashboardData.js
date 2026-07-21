/**
 * Student Dashboard mock data matching Lovable design
 */

export const studentProfile = {
  name: 'Amara Perera',
  role: 'Student',
  email: 'amara.perera@researchsphere.edu',
  avatarInitials: 'AP',
  unreadNotifications: 3,
};

export const studentStats = [
  {
    id: 'total_publications',
    label: 'TOTAL PUBLICATIONS',
    value: '9',
    badge: '+2 this month',
    icon: 'BookOpen',
    variant: 'blue',
  },
  {
    id: 'approved',
    label: 'APPROVED',
    value: '7',
    icon: 'CheckCircle2',
    variant: 'green',
  },
  {
    id: 'pending',
    label: 'PENDING',
    value: '1',
    icon: 'Clock',
    variant: 'amber',
  },
  {
    id: 'rejected',
    label: 'REJECTED',
    value: '1',
    icon: 'XCircle',
    variant: 'red',
  },
  {
    id: 'drafts',
    label: 'DRAFTS',
    value: '0',
    icon: 'FileText',
    variant: 'blue-light',
  },
  {
    id: 'total_views',
    label: 'TOTAL VIEWS',
    value: '16,596',
    badge: '+18% vs last month',
    icon: 'Eye',
    variant: 'purple',
  },
  {
    id: 'downloads',
    label: 'DOWNLOADS',
    value: '4,144',
    badge: '+12% vs last month',
    icon: 'Download',
    variant: 'teal',
  },
  {
    id: 'category_rank',
    label: 'CATEGORY RANK',
    value: '#4',
    subtitle: 'Top 5% in Computer Science',
    icon: 'Trophy',
    variant: 'gold',
  },
];

export const monthlyActivity = {
  months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  views: [320, 480, 710, 1050, 1540, 2100],
  downloads: [80, 110, 160, 240, 310, 430],
};

export const approvalTrend = [
  { month: 'Jul', count: 1 },
  { month: 'Aug', count: 2 },
  { month: 'Sep', count: 1 },
  { month: 'Oct', count: 3 },
  { month: 'Nov', count: 2 },
  { month: 'Dec', count: 4 },
];

export const recentSubmissions = [
  {
    id: 1,
    title: 'Transformer-Based Approaches for Low-Resource Sinhala NLP',
    category: 'Agronomy',
    pages: 27,
    status: 'APPROVED',
  },
  {
    id: 2,
    title: 'Federated Learning for Privacy-Preserving Medical Imaging',
    category: 'Performing Arts',
    pages: 29,
    status: 'APPROVED',
  },
  {
    id: 3,
    title: 'A Bayesian Framework for Rainfall Prediction in South Asia',
    category: 'Genetics',
    pages: 20,
    status: 'APPROVED',
  },
  {
    id: 4,
    title: 'Blockchain-Backed Digital Credentials for University Certifications',
    category: 'Marketing',
    pages: 28,
    status: 'APPROVED',
  },
  {
    id: 5,
    title: 'Deep Reinforcement Learning for Autonomous Warehouse Robotics',
    category: 'Physical',
    pages: 22,
    status: 'APPROVED',
  },
];

export const recentActivity = [
  {
    id: 1,
    text: 'Supervisor approved your paper',
    time: '2 hours ago',
  },
  {
    id: 2,
    text: 'New comment on your draft',
    time: 'Yesterday',
  },
  {
    id: 3,
    text: '3 new downloads on your latest paper',
    time: '2 days ago',
  },
  {
    id: 4,
    text: 'Repository admin published your paper',
    time: '5 days ago',
  },
];

export const continueWhereYouLeftOff = [
  {
    id: 1,
    tag: 'AGRICULTURE - AGRONOMY',
    title: 'Transformer-Based Approaches for Low-Resource Sinhala NLP',
    abstract: 'This study investigates transformer-based approaches for low-resource sinhala nlp, addressing a well-defined research gap through...',
    status: 'APPROVED',
    date: '21 May 2026',
    pages: 27,
    views: '533',
    downloads: '473',
  },
  {
    id: 2,
    tag: 'ARTS - PERFORMING ARTS',
    title: 'Federated Learning for Privacy-Preserving Medical Imaging',
    abstract: 'This study investigates federated learning for privacy-preserving medical imaging, addressing a well-defined research gap through...',
    status: 'APPROVED',
    date: '24 May 2026',
    pages: 29,
    views: '2,264',
    downloads: '464',
  },
  {
    id: 3,
    tag: 'BIOLOGY - GENETICS',
    title: 'A Bayesian Framework for Rainfall Prediction in South Asia',
    abstract: 'This study investigates a bayesian framework for rainfall prediction in south asia, addressing a well-defined research gap through...',
    status: 'APPROVED',
    date: '27 May 2026',
    pages: 20,
    views: '719',
    downloads: '304',
  },
];
