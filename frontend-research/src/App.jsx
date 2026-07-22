import { useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';

/**
 * Root App component
 * Provides the overall layout structure: Navbar + Page Content + Footer
 */
function App() {
  const location = useLocation();
  const isDashboardOrAuthPage =
    location.pathname.startsWith('/auth/') ||
    location.pathname.startsWith('/supervisor/') ||
    location.pathname.startsWith('/student/') ||
    location.pathname.startsWith('/admin/') ||
    ['/login', '/register', '/forgot-password', '/chooseregistration', '/newstudentregistegpage'].includes(location.pathname);

  return (
    <>
      {!isDashboardOrAuthPage && <Navbar />}
      <AppRoutes />
      {!isDashboardOrAuthPage && <Footer />}
    </>
  );
}

export default App;
