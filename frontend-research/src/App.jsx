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
  const isAuthPage =
    location.pathname.startsWith('/auth/') ||
    ['/login', '/register', '/forgot-password'].includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Navbar />}
      <AppRoutes />
      {!isAuthPage && <Footer />}
    </>
  );
}

export default App;
