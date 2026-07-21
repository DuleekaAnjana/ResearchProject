import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import styles from './NotFound.module.css';

/**
 * 404 Not Found page
 */
const NotFound = () => {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.description}>
          Sorry, we couldn't find the page you're looking for.
          The page might have been removed or the URL is incorrect.
        </p>
        <div className={styles.actions}>
          <Button
            to="/"
            variant="primary"
            size="lg"
            iconLeft={<Home size={18} />}
          >
            Back to Home
          </Button>
          <Button
            variant="outline"
            size="lg"
            iconLeft={<ArrowLeft size={18} />}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
