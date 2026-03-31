import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff } from 'lucide-react';
import disabilityIcon from '../../assets/Onboarding/icons8-disability-24.png';
import familyIcon from '../../assets/Onboarding/icons8-family-64.png';
import styles from './RegisterDesktop.module.css';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordRepeat: string;
  termsAccepted: boolean;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function RegisterDesktop() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordRepeat: '',
    termsAccepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vorname ist erforderlich';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nachname ist erforderlich';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Gültige E-Mail erforderlich';
    }
    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Passwort mindestens 8 Zeichen';
    }
    if (!formData.passwordRepeat) {
      newErrors.passwordRepeat = 'Passwort wiederholen erforderlich';
    } else if (formData.password !== formData.passwordRepeat) {
      newErrors.passwordRepeat = 'Passwörter stimmen nicht überein';
    }
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'Nutzungsbedingungen müssen akzeptiert werden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof FormData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormData];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await navigate({ to: '/login' });
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      {/* Main Content */}
      <div className={styles.container}>
        {/* Left Hero Section */}
        <section className={styles['hero-panel']}>
          <div className={styles['hero-content']}>
            <h1 className={styles['hero-title']}>
              Einmalig einrichten — dauerhaft
              <br />
              <span className={styles['title-accent']}>barrierefreireisen</span>
            </h1>
            <p className={styles['hero-copy']}>
              Gestalten Sie Ihre Reise so individuell wie Ihre Bedürfnisse. Ihr Profil speichert
              Ihre Präferenzen für ein nahtloses Erlebnis.
            </p>

            {/* Benefits */}
            <div className={styles['benefits-list']}>
              <div className={styles['benefit-item']}>
                <div className={styles['benefit-icon']}>
                  <img src={disabilityIcon} alt="" className={styles['benefit-icon-img']} />
                </div>
                <div className={styles['benefit-text']}>
                  <h3 className={styles['benefit-title']}>Individuelle Assistenz</h3>
                  <p className={styles['benefit-description']}>
                    Buchen Sie Ein- und Ausstigehilfen mit nur einem Klick für jede Verbindung.
                  </p>
                </div>
              </div>

              <div className={styles['benefit-item']}>
                <div className={styles['benefit-icon']}>
                  <Eye size={24} />
                </div>
                <div className={styles['benefit-text']}>
                  <h3 className={styles['benefit-title']}>Visuelle Führung</h3>
                  <p className={styles['benefit-description']}>
                    Optimierte Anschichten und kontrastreich Dokumente direkt in Ihrer App.
                  </p>
                </div>
              </div>

              <div className={styles['benefit-item']}>
                <div className={styles['benefit-icon']}>
                  <img src={familyIcon} alt="" className={styles['benefit-icon-img']} />
                </div>
                <div className={styles['benefit-text']}>
                  <h3 className={styles['benefit-title']}>Barrierefreie Bahnhöfe</h3>
                  <p className={styles['benefit-description']}>
                    Echtzeit-Informationen über Aufzüge und Rampen auf Ihrer Route.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Form Section */}
        <section className={styles['form-panel']} aria-labelledby="register-heading">
          <h2 id="register-heading" className={styles['form-heading']}>
            Konto erstellen
          </h2>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* First Name & Last Name */}
            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="firstName" className={styles.label}>
                  Vorname
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Elias"
                  className={`${styles.input} ${errors.firstName ? styles['input-error'] : ''}`}
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                />
                {errors.firstName && (
                  <span id="firstName-error" className={styles['error-message']}>
                    {errors.firstName}
                  </span>
                )}
              </div>

              <div className={styles['form-group']}>
                <label htmlFor="lastName" className={styles.label}>
                  Nachname
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Müller"
                  className={`${styles.input} ${errors.lastName ? styles['input-error'] : ''}`}
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                />
                {errors.lastName && (
                  <span id="lastName-error" className={styles['error-message']}>
                    {errors.lastName}
                  </span>
                )}
              </div>
            </div>

            {/* Email */}
            <div className={styles['form-group']}>
              <label htmlFor="email" className={styles.label}>
                E-Mail Addresse
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="beispiel@domain.de"
                className={`${styles.input} ${errors.email ? styles['input-error'] : ''}`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <span id="email-error" className={styles['error-message']}>
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className={styles['form-group']}>
              <label htmlFor="password" className={styles.label}>
                Passwort
              </label>
              <div className={styles['password-input-wrapper']}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="• • • • • • • •"
                  className={`${styles.input} ${errors.password ? styles['input-error'] : ''}`}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles['password-toggle']}
                  aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <span id="password-error" className={styles['error-message']}>
                  {errors.password}
                </span>
              )}
            </div>

            {/* Password Repeat */}
            <div className={styles['form-group']}>
              <label htmlFor="passwordRepeat" className={styles.label}>
                Passwort Bestätigen
              </label>
              <div className={styles['password-input-wrapper']}>
                <input
                  id="passwordRepeat"
                  type={showPasswordRepeat ? 'text' : 'password'}
                  name="passwordRepeat"
                  value={formData.passwordRepeat}
                  onChange={handleChange}
                  placeholder="• • • • • • • •"
                  className={`${styles.input} ${errors.passwordRepeat ? styles['input-error'] : ''}`}
                  aria-invalid={!!errors.passwordRepeat}
                  aria-describedby={errors.passwordRepeat ? 'passwordRepeat-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordRepeat(!showPasswordRepeat)}
                  className={styles['password-toggle']}
                  aria-label={showPasswordRepeat ? 'Passwort verbergen' : 'Passwort anzeigen'}
                >
                  {showPasswordRepeat ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.passwordRepeat && (
                <span id="passwordRepeat-error" className={styles['error-message']}>
                  {errors.passwordRepeat}
                </span>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className={styles['checkbox-group']}>
              <input
                id="termsAccepted"
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className={styles.checkbox}
                aria-invalid={!!errors.termsAccepted}
                aria-describedby={errors.termsAccepted ? 'termsAccepted-error' : undefined}
              />
              <label htmlFor="termsAccepted" className={styles['checkbox-label']}>
                Ich stimme den Nutzungsbedingungen zu.{' '}
                <a href="#privacy" className={styles['privacy-link']}>
                  Datenschutz lesen
                </a>
              </label>
            </div>
            {errors.termsAccepted && (
              <span id="termsAccepted-error" className={styles['error-message']}>
                {errors.termsAccepted}
              </span>
            )}

            {/* Submit Button */}
            <button type="submit" className={styles['submit-button']} disabled={isSubmitting}>
              {isSubmitting ? 'Wird erstellt...' : 'Konto erstellen'}
            </button>
          </form>

          {/* Login Link */}
          <p className={styles['login-link-wrapper']}>
            Bereits registriert?{' '}
            <Link to="/login" className={styles['login-link']}>
              Anmelden
            </Link>
          </p>

          {/* Security Notice */}
          <div className={styles['security-notice']}>
            <span className={styles['lock-icon']}>🔒</span>
            <span className={styles['security-text']}>
              Sichere Ende-zu-Ende Verschlüsselung Ihrer Daten
            </span>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <Link to="/" className={styles['footer-logo']}>
          Trans-Europe Line
        </Link>
        <div className={styles['footer-links']}>
          <a href="#impressum">Impressum</a>
          <a href="#datenschutz">Datenschutz</a>
          <a href="#barrierefreiheit">Barrierefreiheit</a>
          <a href="#kontakt">Kontakt</a>
        </div>
        <p className={styles['footer-text']}>
          © 2024 Trans-Europe Line. Barrierefreies Reisen für alle.
        </p>
      </footer>
    </main>
  );
}
