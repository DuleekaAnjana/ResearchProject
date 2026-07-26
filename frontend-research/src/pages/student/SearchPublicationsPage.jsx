import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  Bell,
  BookOpen,
  ChevronRight,
  Folder,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Bookmark,
  Compass,
  User,
  LayoutDashboard,
  BarChart3,
  X,
  Calendar,
  Eye,
  Download,
  File
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StudentSidebar from '../../components/layout/StudentSidebar';
import StudentFooter from '../../components/layout/StudentFooter';
import styles from './SearchPublicationsPage.module.css';
import dashboardStyles from './StudentDashboard.module.css';
import pubCardStyles from './AllPublicationsPage.module.css';

/**
 * SearchPublicationsPage – Displays all approved publications with search/filter.
 * Accessible via the top search bar or sidebar "All Publications" link.
 */
const SearchPublicationsPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewPaper, setPreviewPaper] = useState(null);

  const searchInputRef = useRef(null);

  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('previous_searches_student');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addToHistory = (searchTerm) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 8);
      localStorage.setItem('previous_searches_student', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromHistory = (e, indexToRemove) => {
    e.stopPropagation();
    setSearchHistory((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      localStorage.setItem('previous_searches_student', JSON.stringify(updated));
      return updated;
    });
  };

  const handleHistoryClick = (term) => {
    setQuery(term);
    addToHistory(term);
  };

  // Add initial search query to history if present
  useEffect(() => {
    if (initialQuery) {
      addToHistory(initialQuery);
    }
  }, [initialQuery]);

  // Auto focus input if focus parameter is present
  useEffect(() => {
    const isFocus = searchParams.get('focus') === 'true';
    if (isFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchParams]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      addToHistory(query);
    }
  };

  // ---- Fetch papers ----
  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true);
      try {
        const data = await api.get('/papers');
        const allPapers = data || [];
        const publishedPapers = allPapers.filter(p => p.isPublished);
        setPapers(publishedPapers);
      } catch (err) {
        console.warn('Failed to fetch papers:', err);
        setPapers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  const handleDownload = (paper) => {
    const docInfo = `
%PDF-1.4
% ResearchSphere Manuscript PDF File
Title: ${paper.title}
Author: ${paper.studentName || 'Registered Student'}
Category: ${paper.category || 'General'}
Subcategory: ${paper.subcategory || 'General'}
Pages: ${paper.pages || 0}
Views: ${paper.views || 0}
Downloads: ${paper.downloads || 0}
Submitted At: ${paper.submittedAt || 'N/A'}
Status: ${paper.status}
--------------------------------------------------
Abstract:
${paper.abstractText}

Research Gap:
${paper.researchGap || 'Not specified.'}

Keywords:
${paper.keywords || ''}
`;
    const blob = new Blob([docInfo], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = paper.pdfFileName || `${paper.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_manuscript.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryBadge = (category) => {
    const cat = category || 'Computer Science';
    let bg = '#e0f2fe';
    let fg = '#0369a1';
    if (cat.toLowerCase().includes('computer')) {
      bg = '#ecfdf5';
      fg = '#047857';
    } else if (cat.toLowerCase().includes('medicine')) {
      bg = '#fdf2f8';
      fg = '#be185d';
    } else if (cat.toLowerCase().includes('engineering')) {
      bg = '#fff7ed';
      fg = '#c2410c';
    } else if (cat.toLowerCase().includes('statistics')) {
      bg = '#f5f3ff';
      fg = '#6d28d9';
    }
    return (
      <span style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        backgroundColor: bg,
        color: fg,
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        textTransform: 'uppercase',
        letterSpacing: '0.025em'
      }}>
        {cat}
      </span>
    );
  };

  // ---- Filter papers by query ----
  const filteredPapers = papers.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      (p.student || p.studentName || '').toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className={dashboardStyles.dashboardLayout}>
      {/* Sidebar */}
      {sidebarOpen && <StudentSidebar />}

      {/* Main */}
      <div className={dashboardStyles.mainContainer}>
        <DashboardHeader
          onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          notificationsRoute="/student/notifications"
        />

        <div className={dashboardStyles.contentWrapper}>
          <div className={styles.pageWrapper}>
            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
              <Link to="/" className={styles.breadcrumbLink}>Home</Link>
              <ChevronRight size={14} />
              <Link to="/student/dashboard" className={styles.breadcrumbLink}>Student</Link>
              <ChevronRight size={14} />
              <span className={styles.breadcrumbCurrent}>All Publications</span>
            </div>

            {/* Page Header */}
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>All Publications</h1>
              <p className={styles.pageSubtitle}>
                Browse and search all research publications in the repository.
              </p>
            </div>

            {/* Search Bar */}
            <div className={styles.searchRow}>
              <div className={styles.searchField}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  id="publications-search-input"
                  ref={searchInputRef}
                  className={styles.searchInput}
                  placeholder="Search by title, author, or category..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            {/* Previous Searches */}
            {searchHistory.length > 0 && (
              <div className={styles.historyContainer}>
                <span className={styles.historyLabel}>Previous searches:</span>
                <div className={styles.historyChips}>
                  {searchHistory.map((term, index) => (
                    <div
                      key={index}
                      className={styles.historyChip}
                      onClick={() => handleHistoryClick(term)}
                    >
                      <span>{term}</span>
                      <button
                        type="button"
                        className={styles.removeHistoryBtn}
                        onClick={(e) => removeFromHistory(e, index)}
                        aria-label={`Remove search term ${term}`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results Count */}
            {!loading && (
              <div className={styles.resultsHeader}>
                <span className={styles.resultsCount}>
                  {filteredPapers.length} result{filteredPapers.length !== 1 ? 's' : ''}
                  {query ? ` for "${query}"` : ''}
                </span>
              </div>
            )}

            {/* Results */}
            {loading ? (
              <div className={styles.loadingState}>Loading publications…</div>
            ) : filteredPapers.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyStateTitle}>No publications found</p>
                <p className={styles.emptyStateDesc}>
                  Try a different search term or clear the filter.
                </p>
              </div>
            ) : (
              <div className={pubCardStyles.publicationsGrid}>
                {filteredPapers.map((paper) => (
                  <div key={paper.id} className={pubCardStyles.pubCard}>
                    <div className={pubCardStyles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {paper.formattedPublicationId || `PUB-${paper.id}`}
                      </span>
                      {getCategoryBadge(paper.category)}
                    </div>

                    <h3 className={pubCardStyles.pubTitle}>{paper.title}</h3>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        {paper.subcategory || 'General'}
                      </span>
                      {paper.keywords && paper.keywords.trim() && paper.keywords.split(',').map((kw, idx) => (
                        <span key={idx} style={{ fontSize: '0.65rem', fontWeight: 600, backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>
                          {kw.trim()}
                        </span>
                      ))}
                    </div>

                    <p className={pubCardStyles.pubAbstract}>
                      {paper.abstractText && paper.abstractText.length > 150 
                        ? `${paper.abstractText.substring(0, 150)}......` 
                        : paper.abstractText}
                    </p>

                    <div className={pubCardStyles.pubMeta}>
                      <span className={pubCardStyles.metaItem}>
                        <Calendar size={14} />
                        {formatDate(paper.submittedAt || paper.reviewedAt)}
                      </span>
                      <span className={pubCardStyles.metaItem}>
                        <FileText size={14} />
                        {paper.pages || 0} pages
                      </span>
                      <span className={pubCardStyles.metaItem}>
                        <Eye size={14} />
                        {paper.views || 0}
                      </span>
                      <span className={pubCardStyles.metaItem}>
                        <Download size={14} />
                        {paper.downloads || 0}
                      </span>
                    </div>

                    <div className={pubCardStyles.cardActions}>
                      <button
                        type="button"
                        onClick={() => setPreviewPaper(paper)}
                        className={`${pubCardStyles.actionBtn} ${pubCardStyles.previewBtn}`}
                        title="Preview manuscript"
                      >
                        <Eye size={14} />
                        Preview
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(paper)}
                        className={`${pubCardStyles.actionBtn} ${pubCardStyles.downloadBtn}`}
                        title="Download PDF"
                      >
                        <Download size={14} />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <StudentFooter />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewPaper && (
        <div className={pubCardStyles.modalOverlay} onClick={() => setPreviewPaper(null)}>
          <div className={pubCardStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={pubCardStyles.modalHeader}>
              <div className={pubCardStyles.modalTitleArea}>
                <File size={20} className={pubCardStyles.modalFileIcon} />
                <h3>Document Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPaper(null)}
                className={pubCardStyles.modalCloseBtn}
                title="Close preview"
              >
                <X size={20} />
              </button>
            </div>

            <div className={pubCardStyles.modalBody}>
              <div className={pubCardStyles.pdfPaperFrame}>
                <div className={pubCardStyles.pdfHeader}>
                  <div className={pubCardStyles.pdfHeaderBrand}>ResearchSphere Repository</div>
                  <div className={pubCardStyles.pdfHeaderMeta}>
                    Pages: {previewPaper.pages || 0}
                  </div>
                </div>

                <div className={pubCardStyles.pdfContent}>
                  <h1 className={pubCardStyles.pdfTitle}>{previewPaper.title}</h1>
                  
                  <div className={pubCardStyles.pdfAuthorLine}>
                    By {previewPaper.studentName || 'Registered Student'}
                  </div>
                  <div className={pubCardStyles.pdfCategoryLine}>
                    Subject Area: {previewPaper.category} {previewPaper.subcategory ? `(${previewPaper.subcategory})` : ''}
                  </div>

                  <div className={pubCardStyles.pdfSection}>
                    <h2 className={pubCardStyles.pdfSectionTitle}>Abstract</h2>
                    <p className={pubCardStyles.pdfParagraph}>{previewPaper.abstractText}</p>
                  </div>

                  {previewPaper.researchGap && (
                    <div className={pubCardStyles.pdfSection}>
                      <h2 className={pubCardStyles.pdfSectionTitle}>Research Gap</h2>
                      <p className={pubCardStyles.pdfParagraph}>{previewPaper.researchGap}</p>
                    </div>
                  )}

                  {previewPaper.keywords && (
                    <div className={pubCardStyles.pdfSection}>
                      <h2 className={pubCardStyles.pdfSectionTitle}>Keywords</h2>
                      <p className={pubCardStyles.pdfKeywords}>{previewPaper.keywords}</p>
                    </div>
                  )}

                  <div className={pubCardStyles.pdfFooter}>
                    Simulated PDF View. Generated on {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className={pubCardStyles.modalFooter}>
              <button
                type="button"
                className={pubCardStyles.modalCloseBtnSecondary}
                onClick={() => setPreviewPaper(null)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className={pubCardStyles.modalDownloadBtn}
                onClick={() => {
                  handleDownload(previewPaper);
                  setPreviewPaper(null);
                }}
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPublicationsPage;
