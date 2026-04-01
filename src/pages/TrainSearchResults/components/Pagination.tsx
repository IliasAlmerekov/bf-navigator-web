import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Seiten Navigation" className={styles.nav}>
      <button
        aria-label="Vorherige Seite"
        className={styles.btn}
        disabled={currentPage === 1}
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft aria-hidden="true" className={styles.icon} />
      </button>

      <ol className={styles.pages} role="list">
        {pages.map((page) => (
          <li key={page}>
            <button
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Seite ${page}`}
              className={styles.pageBtn}
              data-active={page === currentPage}
              type="button"
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}
      </ol>

      <button
        aria-label="Nächste Seite"
        className={styles.btn}
        disabled={currentPage === totalPages}
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight aria-hidden="true" className={styles.icon} />
      </button>
    </nav>
  );
}
