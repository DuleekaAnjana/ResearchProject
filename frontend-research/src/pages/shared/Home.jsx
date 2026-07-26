import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  FileText,
  Users,
  BarChart3,
  Search as SearchIcon,
  GraduationCap,
  Monitor,
  ShieldCheck,
} from 'lucide-react';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import PublicationCard from '../../components/common/PublicationCard';
import StatCounter from '../../components/common/StatCounter';
import { featuredPublications } from '../../data/publications';
import { homeStats } from '../../data/stats';
import styles from './Home.module.css';

/**
 * Home / Landing page
 * Matches the Lovable screenshot design
 */

/** Role cards data */
const roles = [
  {
    id: 'student',
    icon: GraduationCap,
    title: 'Student',
    description:
      'Submit your research, track approvals, discover papers in your field.',
    link: '/auth/student/login',
  },
  {
    id: 'supervisor',
    icon: Monitor,
    title: 'Supervisor',
    description:
      'Review assigned submissions and share structured, actionable feedback.',
    link: '/auth/supervisor/login',
  },
  {
    id: 'admin',
    icon: ShieldCheck,
    title: 'Administrator',
    description:
      'Manage users, curate the repository, and oversee the entire system.',
    link: '/auth/admin/login',
  },
];

/** Platform feature cards data kkkk*/
const features = [
  {
    id: 1,
    icon: FileText,
    title: 'Guided submissions',
    description:
      'Structured forms, PDF uploads, and duplicate checks.',
  },
  {
    id: 2,
    icon: Users,
    title: 'Supervisor matching',
    description:
      'Recommended experts based on your research category.',
  },
  {
    id: 3,
    icon: BarChart3,
    title: 'Analytics',
    description:
      'Views, downloads, approvals, and rank across the system.',
  },
  {
    id: 4,
    icon: SearchIcon,
    title: 'Powerful discovery',
    description:
      'Search titles, authors, keywords, categories and years.',
  },
];

/** Discipline tags */
const disciplines = [
  'Agriculture',
  'Arts',
  'Biology',
  'Business',
  'Chemistry',
  'Computer Science',
  'Economics',
  'Education',
  'Engineering',
  'Environmental Science',
  'Humanities',
  'Law',
  'Mathematics',
  'Medicine',
  'Physics',
  'Social Science',
  'Statistics',
];

const ROLE_CARD_THEMES = {
  student: {
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    textColor: '#1e3a8a',
    descriptionColor: '#1e40af',
    btnColor: '#2563eb',
    iconBg: '#2563eb',
    borderColor: '#bfdbfe'
  },
  supervisor: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    textColor: '#14532d',
    descriptionColor: '#166534',
    btnColor: '#10b981',
    iconBg: '#10b981',
    borderColor: '#bbf7d0'
  },
  admin: {
    background: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
    textColor: '#713f12',
    descriptionColor: '#a16207',
    btnColor: '#ca8a04',
    iconBg: '#ca8a04',
    borderColor: '#fef08a'
  }
};

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (window.location.hash === '#signin') {
      setTimeout(() => {
        const el = document.getElementById('signin');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  const handleSearch = (query) => {
    // TODO: Navigate to search results page with query
    console.log('Search for:', query);
  };

  const handlePublicationClick = (publication) => {
    // TODO: Navigate to publication detail page
    console.log('View publication:', publication.id);
  };

  return (
    <main className={styles.home}>
      {/* ====== Hero Section ====== */}
      <section className={styles.hero}>
        {/* Left Column */}
        <div className={styles.heroLeft}>
          {/* Trusted Badge */}
          <div className={styles.trustedBadge}>
            <Sparkles size={16} className={styles.sparkleIcon} style={{ color: '#5c061a' }} />
            <span>Trusted by 42 universities</span>
          </div>

          {/* Heading */}
          <h1 className={styles.heading}>
            A modern home for{' '}
            <span className={styles.headingAccent} style={{ color: '#5c061a' }}>student research.</span>
          </h1>

          {/* Subtext */}
          <p className={styles.subtext}>
            Submit publications, receive expert supervisor feedback, and
            discover peer-reviewed research across every academic discipline
            — in one professional repository built for higher education.
          </p>

          {/* CTA Buttons */}
          <div className={styles.ctaGroup}>
            <Button
              onClick={() => {
                const el = document.getElementById('signin');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              variant="primary"
              size="lg"
              iconRight={<ArrowRight size={16} />}
              style={{ backgroundColor: '#5c061a', borderColor: '#5c061a' }}
            >
              Choose your sign-in
            </Button>
            <Button
              to="/register"
              variant="outline"
              size="lg"
              style={{ color: '#5c061a', borderColor: '#5c061a' }}
            >
              Create an account
            </Button>
          </div>

          {/* Stats Row */}
          <div className={styles.statsRow}>
            {homeStats.map((stat) => (
              <StatCounter
                key={stat.id}
                value={stat.value}
                label={stat.label}
              />
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.heroRight}>
          {/* Search Bar */}
          <SearchBar
            placeholder='Search "Federated Learning", "Bayesian Rainfall"...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSubmit={handleSearch}
          />

          {/* Featured Publication Cards */}
          <div className={styles.publicationList}>
            {featuredPublications.map((pub) => (
              <PublicationCard
                key={pub.id}
                publication={pub}
                onClick={() => handlePublicationClick(pub)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ====== Get Started / Role Cards Section ====== */}
      <section id="signin" className={styles.rolesSection}>
        <div className={styles.sectionInner}>
          <span className={styles.sectionLabel} style={{ color: '#5c061a' }}>GET STARTED</span>
          <h2 className={styles.sectionHeading}>Choose your sign-in</h2>
          <p className={styles.sectionSubtext}>
            Different responsibilities, one repository. Select the portal that matches you and your role..
          </p>
        </div>

        <div className={styles.rolesGrid}>
          {roles.map((role) => {
            const RoleIcon = role.icon;
            const rTheme = ROLE_CARD_THEMES[role.id];
            return (
              <div key={role.id} className={styles.roleCard} style={{ background: rTheme.background, borderColor: rTheme.borderColor }}>
                <div className={styles.roleIcon} style={{ backgroundColor: rTheme.iconBg }}>
                  <RoleIcon size={20} className={styles.roleIconInner} style={{ color: '#ffffff' }} />
                </div>
                <h3 className={styles.roleTitle} style={{ color: rTheme.textColor }}>{role.title}</h3>
                <p className={styles.roleDescription} style={{ color: rTheme.descriptionColor }}>{role.description}</p>
                <Link to={role.link} className={styles.roleLink} style={{ color: rTheme.btnColor }}>
                  Continue <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ====== Platform Features Section ====== */}
      <section id="features" className={styles.platformSection}>
        <div className={styles.sectionInner}>
          <span className={styles.sectionLabel}>PLATFORM</span>
          <h2 className={styles.sectionHeading}>
            Everything a modern research office needs
          </h2>

          <div className={styles.featuresGrid}>
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.id} className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <Icon size={22} />
                  </div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====== Disciplines Section ====== */}
      <section id="disciplines" className={styles.disciplinesSection}>
        <div className={styles.sectionInner}>
          <span className={styles.sectionLabel}>DISCIPLINES</span>
          <h2 className={styles.sectionHeading}>
            17 research categories, hundreds of subfields
          </h2>

          <div className={styles.disciplineTags}>
            {disciplines.map((discipline) => (
              <span key={discipline} className={styles.disciplineTag}>
                {discipline}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
