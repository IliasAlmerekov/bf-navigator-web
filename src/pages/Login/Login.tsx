import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import logoMarkImage from '../../assets/Login/route.png';
import googleIcon from '../../assets/Login/icons8-google-48.png';
import { useLogin } from '../../hooks/useLogin';
import { storeCompletedOnboarding } from '../../utils/accountStorage';
import styles from './Login.module.css';

function BrandGlyph() {
  return (
    <svg
      aria-hidden="true"
      className={styles['brand-glyph']}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="6" y="6" width="8" height="12" rx="4" fill="currentColor" />
      <rect x="18" y="6" width="8" height="20" rx="4" fill="currentColor" />
      <circle cx="10" cy="22" r="2.5" fill="currentColor" />
      <circle cx="22" cy="30" r="2" fill="currentColor" transform="translate(0 -6)" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path
        d="M2.75 12C4.68 8.73 8.01 6.75 12 6.75S19.32 8.73 21.25 12C19.32 15.27 15.99 17.25 12 17.25S4.68 15.27 2.75 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" fill="currentColor" />
    </svg>
  );
}

export default function Login() {
  const { error, isLoading, login } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  function validateForm() {
    const nextErrors: {
      email?: string;
      password?: string;
    } = {};

    if (!email.trim()) {
      nextErrors.email = 'E-Mail-Adresse ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
    }

    if (!password) {
      nextErrors.password = 'Passwort ist erforderlich';
    }

    setFieldErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);

    if (fieldErrors.email) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        email: undefined,
      }));
    }
  }

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);

    if (fieldErrors.password) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        password: undefined,
      }));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(email, password);
      storeCompletedOnboarding();
    } catch {
      // The hook exposes a localized error state for the form.
    }
  }

  const statusMessage = isLoading ? 'Anmeldung wird durchgeführt' : error;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles['top-bar']}>
          <Link className={styles.wordmark} to="/">
            BF-NAVIGATOR
          </Link>
          <nav aria-label="Primary" className={styles.nav}>
            <Link to="/">Home Search</Link>
            <Link to="/saved-trips">Saved Trips</Link>
            <Link to="/alerts">Alerts</Link>
            <Link to="/profile">Profile</Link>
          </nav>
        </header>

        <section className={styles['auth-frame']}>
          <aside className={styles['hero-panel']}>
            <div className={styles['hero-content']}>
              <h2 className={styles['hero-title']}>Reisen ohne Hindernisse.</h2>
              <p className={styles['hero-copy']}>
                Entdecken Sie Europa mit Trans-Europe Line. Wir gestalten den Schienenverkehr neu -
                barrierefrei, elegant und effizient.
              </p>
            </div>

            <div className={styles['hero-badge']}>
              <div className={styles['hero-badge-icon']} aria-hidden="true">
                <BrandGlyph />
              </div>
              <div>
                <p className={styles['hero-badge-title']}>Barrierefreiheit Zuerst</p>
                <p className={styles['hero-badge-text']}>
                  Unsere Routenplanung berücksichtigt Echtzeit-Daten zu Aufzügen, Rampen und
                  Einstiegshilfen an jedem Bahnhof.
                </p>
              </div>
            </div>
          </aside>

          <section className={styles['form-panel']} aria-labelledby="login-heading">
            <div className={styles['brand-mark']} aria-hidden="true">
              <img alt="" className={styles['logo-mark-image']} src={logoMarkImage} />
            </div>

            <div className={styles['form-header']}>
              <h1 className={styles.title} id="login-heading">
                Willkommen zurück
              </h1>
              <p className={styles.subtitle}>
                Melden Sie sich an, um Ihre barrierefreien Routen abzurufen
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="login-email">
                  E-Mail-Adresse
                </label>
                <input
                  aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                  aria-invalid={fieldErrors.email ? 'true' : 'false'}
                  className={`${styles.input} ${fieldErrors.email ? styles['input-error'] : ''}`}
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="name@beispiel.de"
                  value={email}
                  onChange={handleEmailChange}
                />
                {fieldErrors.email && (
                  <span className={styles['error-message']} id="login-email-error">
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              <div className={styles.field}>
                <div className={styles['password-label-row']}>
                  <label className={styles.label} htmlFor="login-password">
                    Passwort
                  </label>
                  <button className={styles['inline-link']} type="button">
                    Passwort vergessen?
                  </button>
                </div>
                <div className={styles['password-input-wrap']}>
                  <input
                    aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                    aria-invalid={fieldErrors.password ? 'true' : 'false'}
                    className={`${styles.input} ${fieldErrors.password ? styles['input-error'] : ''}`}
                    id="login-password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  <button
                    aria-label="Passwort anzeigen"
                    className={styles['eye-button']}
                    type="button"
                  >
                    <EyeIcon />
                  </button>
                </div>
                {fieldErrors.password && (
                  <span className={styles['error-message']} id="login-password-error">
                    {fieldErrors.password}
                  </span>
                )}
              </div>

              <button className={styles['primary-button']} type="submit" disabled={isLoading}>
                <span>Anmelden</span>
                <span aria-hidden="true" className={styles['button-arrow']}>
                  →
                </span>
              </button>

              <p aria-live="polite" className={styles['status-message']} role="status">
                {statusMessage}
              </p>
            </form>

            <div className={styles.divider} aria-hidden="true">
              <span />
              <p>ODER</p>
              <span />
            </div>

            <button className={styles['google-button']} type="button">
              <img alt="" className={styles['google-icon']} src={googleIcon} />
              <span>Mit Google anmelden</span>
            </button>

            <p className={styles['register-prompt']}>
              Noch kein Konto?{' '}
              <Link className={styles['register-link']} to="/register">
                Registrieren
              </Link>
            </p>
          </section>
        </section>

        <footer className={styles.footer}>
          <p>Trans-Europe Line</p>
          <p>&copy; 2024 Trans-Europe Line. High-End Editorial Travel.</p>
          <nav aria-label="Legal" className={styles['footer-links']}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Accessibility</span>
          </nav>
        </footer>
      </div>
    </main>
  );
}
