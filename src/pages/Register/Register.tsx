import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff } from 'lucide-react';
import openIcon from '../../assets/Onboarding/icons8-open-60.png';
import trainWindowPhoto from '../../assets/mobile-layout/bahnübergang-generieren-moderne-generierte-ai-291825100.webp';
import styles from './Register.module.css';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordRepeat: string;
  termsAccepted: boolean;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function Register() {
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

    // Clear error for this field when user starts typing
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // On success, navigate to login
      await navigate({ to: '/login' });
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Header with back button */}
        <header className={styles.header}>
          <Link to="/login" className={styles['back-link']}>
            <span aria-hidden="true">←</span>
            <span>Konto erstellen</span>
          </Link>
        </header>

        {/* Form Section */}
        <section className={styles['form-section']}>
          <div className={styles['form-wrapper']}>
            <h1 className={styles.title}>
              Einmalig einrichten — dauerhaft
              <br />
              <span className={styles['title-accent']}>barrierefreireisen</span>
            </h1>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              {/* First Name & Last Name Row */}
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
                    placeholder="Max"
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
                    placeholder="Mustermann"
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
                  placeholder="name@beispiel.de"
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
          </div>

          {/* Hero Section */}
          <section className={styles['hero-section']}>
            <img
              src={trainWindowPhoto}
              alt="Ausblick aus einem Zugfenster - Barrierefreies Reisen"
              className={styles['hero-image']}
            />

            <div className={styles['benefit-box']}>
              <div className={styles['benefit-icon']} aria-hidden="true">
                <img src={openIcon} alt="" className={styles['benefit-icon-img']} />
              </div>
              <div className={styles['benefit-content']}>
                <h2 className={styles['benefit-title']}>Ihre Reise, Ihre Bedürfnisse.</h2>
                <p className={styles['benefit-text']}>
                  Passen Sie Ihre Präferenzen an Ihre Bedürfnisse an. Wir speichern Ihre
                  Barrierefreiheitseinstellungen für zukünftige Buchungen.
                </p>
              </div>
            </div>
          </section>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <p className={styles['footer-text']}>© 2026 THE EDITORIAL NAVIGATOR</p>
          <div className={styles['footer-links']}>
            <a href="#datenschutz">Datenschutz</a>
            <a href="#impressum">Impressum</a>
            <a href="#hilfe">Hilfe</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
