import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import styles from './ExpandingSearchDock.module.css';

type ExpandingSearchDockProps = {
  onSearch?: (query: string) => void;
  placeholder?: string;
};

export function ExpandingSearchDock({
  onSearch,
  placeholder = 'Search...',
}: ExpandingSearchDockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query) {
      onSearch(query);
    }
  };

  return (
    <div className={styles.root}>
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="icon"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleExpand}
            aria-label="Open search"
            type="button"
            className={styles.trigger}
          >
            <Search aria-hidden="true" className={styles.icon} />
          </motion.button>
        ) : (
          <motion.form
            key="input"
            initial={{ width: 38, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 38, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onSubmit={handleSubmit}
            className={styles.form}
            role="search"
          >
            <motion.div
              initial={{ backdropFilter: 'blur(0px)' }}
              animate={{ backdropFilter: 'blur(12px)' }}
              className={styles['input-wrap']}
            >
              <Search aria-hidden="true" className={styles['input-icon']} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                autoFocus
                aria-label={placeholder}
                className={styles.input}
              />
              <motion.button
                type="button"
                onClick={handleCollapse}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close search"
                className={styles['close-btn']}
              >
                <X aria-hidden="true" className={styles['close-icon']} />
              </motion.button>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
