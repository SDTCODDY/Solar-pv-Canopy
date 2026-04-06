import { Fragment, useEffect, useState, type ChangeEvent, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react';
import {
  Sun, Leaf, Zap, Bird, Tractor, Sprout, Bug,
  Phone, Mail, MapPin, ArrowRight, ShieldAlert,
  Target, CheckCircle2, BarChart3, Menu, X
} from 'lucide-react';

const navLinks = [
  { href: '#vision', label: 'Vision' },
  { href: '#problem', label: 'The Challenge' },
  { href: '#solution', label: 'Our Solution' },
  { href: '#applications', label: 'Applications' },
];

const footerLinks = [...navLinks, { href: '#contact', label: 'Contact' }];

const heroImageSources = {
  sm: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=640&auto=format&fit=crop',
  md: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1200&auto=format&fit=crop',
  lg: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1600&auto=format&fit=crop',
};

const emailJsConfig = {
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim() ?? '',
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim() ?? '',
  contactTemplateId: import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID?.trim() ?? '',
  autoReplyTemplateId: import.meta.env.VITE_EMAILJS_AUTO_REPLY_TEMPLATE_ID?.trim() ?? '',
};

const emptyContactForm = {
  name: '',
  email: '',
  message: '',
  website: '',
};

type ContactForm = typeof emptyContactForm;
type ContactField = Exclude<keyof ContactForm, 'website'>;

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateContactForm = (form: ContactForm) => {
  const errors: Partial<Record<ContactField, string>> = {};

  if (!form.name.trim() || form.name.trim().length < 2) {
    errors.name = 'Please enter your name.';
  }

  if (!isValidEmail(form.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!form.message.trim() || form.message.trim().length < 10) {
    errors.message = 'Please enter a message with at least 10 characters.';
  }

  return errors;
};

const getFriendlyContactError = (response: Response, fallbackText?: string | null) => {
  if (response.status === 404) {
    return 'The contact form backend is not running. Start the website with npm run dev or npm run preview.';
  }

  if (response.status === 503) {
    return fallbackText || 'The contact form is not configured yet. Add the email settings in .env.local.';
  }

  if (response.status >= 500) {
    return fallbackText || 'The server could not send your message right now. Please try again in a few minutes.';
  }

  return fallbackText || 'We could not send your message right now.';
};

const buildEmailJsTemplateParams = (form: ContactForm) => {
  const name = form.name.trim();
  const email = form.email.trim();
  const message = form.message.trim();

  return {
    name,
    full_name: name,
    user_name: name,
    from_name: name,
    email,
    user_email: email,
    from_email: email,
    reply_to: email,
    to_email: email,
    message,
    user_message: message,
  };
};

const sendEmailJsTemplate = async (templateId: string, templateParams: Record<string, string>) => {
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: emailJsConfig.serviceId,
      template_id: templateId,
      user_id: emailJsConfig.publicKey,
      template_params: templateParams,
    }),
  });

  const responseText = await response.text().catch(() => '');

  if (!response.ok) {
    throw new Error(responseText || 'EmailJS could not send your message.');
  }
};

const FadeIn = ({ children, delay = 0 }: { children: ReactNode, delay?: number }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div>{children}</div>;
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </m.div>
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingMobileNavHref, setPendingMobileNavHref] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState<ContactForm>(emptyContactForm);
  const [contactErrors, setContactErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [contactStatus, setContactStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsMenuOpen(false);
      }
    };

    mediaQuery.addEventListener('change', handleBreakpointChange);

    return () => {
      mediaQuery.removeEventListener('change', handleBreakpointChange);
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen || !pendingMobileNavHref) {
      return;
    }

    const target = document.querySelector(pendingMobileNavHref);
    if (target instanceof HTMLElement) {
      target.scrollIntoView({
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });

      if (window.location.hash !== pendingMobileNavHref) {
        window.history.pushState(null, '', pendingMobileNavHref);
      }
    } else {
      window.location.hash = pendingMobileNavHref;
    }

    setPendingMobileNavHref(null);
  }, [isMenuOpen, pendingMobileNavHref, shouldReduceMotion]);

  const handleMobileNavLinkClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) {
      setIsMenuOpen(false);
      return;
    }

    event.preventDefault();
    setPendingMobileNavHref(href);
    setIsMenuOpen(false);
  };

  const handleContactChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    setContactForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    if (name !== 'website') {
      setContactErrors((currentErrors) => {
        if (!(name in currentErrors)) {
          return currentErrors;
        }

        const nextErrors = { ...currentErrors };
        delete nextErrors[name as ContactField];
        return nextErrors;
      });
    }

    if (contactStatus.type !== 'idle') {
      setContactStatus({ type: 'idle', message: '' });
    }
  };

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateContactForm(contactForm);
    setContactErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setContactStatus({
        type: 'error',
        message: 'Please correct the highlighted fields and try again.',
      });
      return;
    }

    setIsSubmittingContact(true);
    setContactStatus({ type: 'idle', message: '' });

    try {
      const trimmedForm = {
        name: contactForm.name.trim(),
        email: contactForm.email.trim(),
        message: contactForm.message.trim(),
        website: contactForm.website.trim(),
      };

      const emailJsReady = Boolean(
        emailJsConfig.publicKey &&
        emailJsConfig.serviceId &&
        emailJsConfig.contactTemplateId,
      );

      if (emailJsReady) {
        const templateParams = buildEmailJsTemplateParams(trimmedForm);
        await sendEmailJsTemplate(emailJsConfig.contactTemplateId, templateParams);

        if (emailJsConfig.autoReplyTemplateId) {
          // Keep the UI fast: confirm success immediately and send the auto-reply in the background.
          window.setTimeout(() => {
            void sendEmailJsTemplate(emailJsConfig.autoReplyTemplateId, templateParams).catch((autoReplyError) => {
              console.warn('EmailJS auto-reply failed:', autoReplyError);
            });
          }, 700);
        }

        setContactForm(emptyContactForm);
        setContactErrors({});
        setContactStatus({
          type: 'success',
          message: emailJsConfig.autoReplyTemplateId
            ? 'Thanks, your message has been sent successfully. A confirmation email should reach you soon.'
            : 'Thanks, your message has been sent successfully.',
        });
        return;

      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedForm.name,
          email: trimmedForm.email,
          message: trimmedForm.message,
          website: trimmedForm.website,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const result = isJson ? await response.json().catch(() => null) : null;
      const fallbackText = !isJson ? await response.text().catch(() => null) : null;

      if (!response.ok) {
        if (result?.fields && typeof result.fields === 'object') {
          setContactErrors(result.fields as Partial<Record<ContactField, string>>);
        }

        throw new Error(getFriendlyContactError(response, result?.error || fallbackText));
      }

      setContactForm(emptyContactForm);
      setContactErrors({});
      setContactStatus({
        type: 'success',
        message: result?.message || 'Thanks, your message has been sent successfully.',
      });
    } catch (error) {
      setContactStatus({
        type: 'error',
        message:
          error instanceof TypeError
            ? 'The contact form backend is not reachable. Start the website with npm run dev or npm run preview.'
            : error instanceof Error
              ? error.message
              : 'We could not send your message right now.',
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen overflow-x-hidden bg-transparent text-stone-800 font-sans selection:bg-emerald-200 selection:text-emerald-900">
        {/* Navigation */}
        <nav className="fixed inset-x-0 top-0 z-50 border-b border-stone-200 bg-[#FDFBF7]/90 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-[4.5rem] items-center justify-between sm:h-20">
              <a href="#top" className="flex items-center shrink-0" aria-label="Solar PV Canopy">
                <img
                  src="/logo.jpeg"
                  alt="Solar PV Canopy logo"
                  className="h-12 w-auto object-contain sm:h-16"
                  decoding="async"
                  fetchPriority="high"
                />
              </a>

              {/* Desktop Menu */}
              <div className="hidden items-center space-x-8 md:flex">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} className="text-sm font-medium text-stone-600 transition-colors hover:text-emerald-700">
                    {link.label}
                  </a>
                ))}
                <a href="#contact" className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-800 hover:shadow-md">
                  Contact Us
                </a>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-expanded={isMenuOpen}
                  aria-controls="mobile-menu"
                  aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  className="rounded-lg p-2 text-stone-600 transition-colors hover:bg-stone-100"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence initial={false}>
            {isMenuOpen && (
              <m.div
                id="mobile-menu"
                initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
                animate={shouldReduceMotion ? { opacity: 1, height: 'auto' } : { opacity: 1, height: 'auto' }}
                exit={shouldReduceMotion ? { opacity: 0, height: 0 } : { opacity: 0, height: 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                className="overflow-hidden border-b border-stone-200 bg-white md:hidden"
              >
                <div className="space-y-1 px-4 pb-6 pt-2">
                  {footerLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(event) => handleMobileNavLinkClick(event, link.href)}
                      className="block rounded-lg px-3 py-3 text-base font-medium text-stone-700 hover:bg-stone-50"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero Section */}
        <section id="top" className="relative overflow-hidden px-0 pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-32 lg:pt-44">
          <div className="absolute inset-0 z-0">
            <img
              src={heroImageSources.md}
              srcSet={`${heroImageSources.sm} 640w, ${heroImageSources.md} 1200w, ${heroImageSources.lg} 1600w`}
              sizes="100vw"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover opacity-15"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7]/80 via-[#FDFBF7]/95 to-[#FDFBF7]"></div>
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <m.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8 }}
              className="mx-auto max-w-4xl"
            >
              <span className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-center text-xs font-semibold tracking-wide text-emerald-800 sm:text-sm">
                <Leaf className="h-4 w-4 shrink-0" /> Gelephu Mindfulness City Initiative
              </span>
              <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-stone-900 sm:mb-8 sm:text-5xl md:text-6xl lg:text-7xl">
                Technologies, Nature, and Communities <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Sitting Under One Canopy.
                </span>
              </h1>
              <p className="mx-auto mb-8 max-w-3xl text-lg font-light leading-relaxed text-stone-600 sm:mb-10 sm:text-xl md:text-2xl">
                Transitioning from an "Energy-Only" utility to a "Multi-Output" land-use model that harmonizes energy, food, and community.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <a href="#solution" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-4 text-base font-medium text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-xl sm:w-auto sm:px-8 sm:text-lg">
                  Explore the Solution <ArrowRight className="h-5 w-5" />
                </a>
                <a href="#problem" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-6 py-4 text-base font-medium text-stone-700 shadow-sm transition-all hover:bg-stone-50 sm:w-auto sm:px-8 sm:text-lg">
                  Understand the Problem
                </a>
              </div>
            </m.div>
          </div>
        </section>

        {/* Quote Banner */}
        <section className="relative overflow-hidden bg-emerald-900 py-14 text-emerald-50 sm:py-16">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                 <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                    <path d="M25 0 L50 14.4 L50 43.4 L25 29 Z" fill="currentColor" />
                    <path d="M0 14.4 L25 0 L25 29 L0 43.4 Z" fill="currentColor" />
                 </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hexagons)" />
           </svg>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <Sun className="w-12 h-12 text-amber-400 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-serif italic font-light leading-relaxed">
            "We don't just produce power; <br className="hidden sm:block"/> we preserve life."
          </h2>
        </div>
        </section>

        {/* About & Context Section */}
        <section id="vision" className="content-auto scroll-mt-28 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-16 lg:grid-cols-2">
            <FadeIn>
              <div className="space-y-8">
                <div>
                  <h3 className="text-emerald-600 font-semibold tracking-wider uppercase text-sm mb-2">Who Are We?</h3>
                  <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">A team united by a single, powerful belief: Sustainability in Technology.</h2>
                  <p className="text-lg text-stone-600 leading-relaxed">
                    Our strength lies in our different educational backgrounds, allowing us to view renewable energy not just as an engineering challenge, but as a biological and social opportunity.
                  </p>
                </div>
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                  <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" /> Resource Integrators
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-stone-700"><strong>Energy Problem:</strong> Solving for the Grid & Utilities</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-stone-700"><strong>Income Problem:</strong> Solving for the Farmers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-stone-700"><strong>Ecological Problem:</strong> Solving for the Government</span>
                    </li>
                  </ul>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-amber-50 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-stone-100">
                  <h3 className="text-2xl font-bold text-stone-900 mb-6 border-b border-stone-100 pb-4">The GMC Vision</h3>
                  <p className="text-stone-600 mb-6 leading-relaxed">
                    Gelephu Mindfulness City (GMC) aims to be a global model of mindfulness and sustainability. Its infrastructure will be powered entirely by renewable energy (hydro, solar, wind), fostering core industries in Agri-Tech & Forestry, and Green Energy.
                  </p>
                  <p className="text-stone-600 mb-8 leading-relaxed">
                    Central to this vision is the preservation of Bhutan's carbon-negative status and values of Gross National Happiness (GNH).
                  </p>

                  <div className="bg-emerald-50 p-6 rounded-2xl">
                    <h4 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" /> 10X Roadmap: Solar Milestones
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-emerald-700">675<span className="text-sm">MW</span></div>
                        <div className="text-xs text-emerald-600 uppercase tracking-wider mt-1">Short-term</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-700">423<span className="text-sm">MW</span></div>
                        <div className="text-xs text-emerald-600 uppercase tracking-wider mt-1">Medium-term</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-700">3.9<span className="text-sm">GW</span></div>
                        <div className="text-xs text-emerald-600 uppercase tracking-wider mt-1">Long-term</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
        </section>

        {/* The Problem Section */}
        <section id="problem" className="content-auto scroll-mt-28 bg-stone-100 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h3 className="text-amber-600 font-semibold tracking-wider uppercase text-sm mb-2">The Challenge</h3>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">Land-Use Conflict in Large-Scale Solar</h2>
              <p className="text-lg text-stone-600">
                While a large-scale Solar PV power plant is mandatory for GMC's energy independence, traditional solar farm designs require extensive land footprints. Converting vast areas into "energy-only" zones creates significant conflicts.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Tractor className="w-8 h-8 text-amber-500" />,
                title: "Land Displacement",
                desc: "Traditional solar farms exclude agricultural and livestock activities, potentially reducing local food security."
              },
              {
                icon: <Leaf className="w-8 h-8 text-emerald-500" />,
                title: "Ecological Fragmentation",
                desc: "Conventional fencing and land clearing for solar panels can disrupt local biodiversity and forestry ecosystems."
              },
              {
                icon: <Sun className="w-8 h-8 text-orange-500" />,
                title: "Climatic Inefficiency",
                desc: "In hot, humid climates, ground-mounted panels lose efficiency due to heat, while soil beneath becomes degraded."
              }
            ].map((item, i) => (
              <Fragment key={i}>
                <FadeIn delay={i * 0.1}>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 h-full hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mb-6">
                      {item.icon}
                    </div>
                    <h4 className="text-xl font-bold text-stone-900 mb-4">{item.title}</h4>
                    <p className="text-stone-600 leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              </Fragment>
            ))}
          </div>
        </div>
        </section>

        {/* The Solution Section */}
        <section id="solution" className="content-auto scroll-mt-28 overflow-hidden bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-16 lg:grid-cols-2">
            <FadeIn>
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                {/* Abstract illustration of the canopy */}
                <div className="aspect-square rounded-full bg-emerald-50 absolute -top-12 -left-12 w-full h-full -z-10 opacity-50 blur-3xl"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4 mt-12">
                    <div className="bg-emerald-700 p-6 rounded-3xl text-white shadow-lg transform hover:-translate-y-1 transition-transform">
                      <Zap className="w-8 h-8 mb-4 text-emerald-200" />
                      <h4 className="font-bold text-lg mb-2">1. Clean Energy</h4>
                      <p className="text-emerald-100 text-sm">Advanced solar PV farms powering the grid.</p>
                    </div>
                    <div className="bg-amber-500 p-6 rounded-3xl text-white shadow-lg transform hover:-translate-y-1 transition-transform">
                      <Bug className="w-8 h-8 mb-4 text-amber-100" />
                      <h4 className="font-bold text-lg mb-2">3. Eco-Restoration</h4>
                      <p className="text-amber-100 text-sm">Pollinator oases and biodiversity corridors.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-stone-800 p-6 rounded-3xl text-white shadow-lg transform hover:-translate-y-1 transition-transform">
                      <Sprout className="w-8 h-8 mb-4 text-stone-300" />
                      <h4 className="font-bold text-lg mb-2">2. Food & Livestock</h4>
                      <p className="text-stone-300 text-sm">Integration of agriculture with solar infrastructure.</p>
                    </div>
                    <div className="bg-stone-100 p-6 rounded-3xl border border-stone-200 flex items-center justify-center aspect-square">
                      <div className="text-center">
                        <div className="text-4xl font-black text-emerald-600 mb-2">3x</div>
                        <div className="text-sm font-bold text-stone-600 uppercase tracking-widest">Output</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div>
                <h3 className="text-emerald-600 font-semibold tracking-wider uppercase text-sm mb-2">The Opportunity</h3>
                <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">The "Mindfulness Solar PV Canopy"</h2>
                <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                  How can we be mindful while constructing large-scale solar PV farms for GMC? The problem is not a lack of land, but a lack of integrated design.
                </p>
                <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                  We propose a framework that moves away from sole utilization of energy sites toward multi-functional landscapes. A solution that optimizes a single plot of land for triple-output.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Sprout className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-stone-900 mb-2">Agriculture</h4>
                      <p className="text-stone-600">Managed dappled shade for high-value crop cultivation (leafy greens, root vegetables, specialty herbs).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Bird className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-stone-900 mb-2">Livestock</h4>
                      <p className="text-stone-600">Climate-smart sanctuaries for livestock farming (sheep, poultry, cattle).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <Bug className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-stone-900 mb-2">Apiculture & Floriculture</h4>
                      <p className="text-stone-600">Pollinator corridors for honey production and floral cultivation.</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
        </section>

        {/* Deep Dive: Livestock Section */}
        <section id="applications" className="content-auto scroll-mt-28 bg-gradient-to-br from-emerald-50 via-stone-50 to-amber-50 py-20 text-stone-900 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">Dual-Use Focus: Livestock Integration</h2>
              <p className="text-lg text-stone-600">
                Livestock are fed on grazing under the shadow of Solar panel support structures. The flattening action of grazing animals integrates organic matter into the soil, while their manure acts as a natural fertilizer.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <FadeIn delay={0.1}>
              <div className="bg-white/90 p-8 rounded-3xl border border-emerald-100 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all">
                <h4 className="text-2xl font-bold text-stone-900 mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">01</span>
                  Sheep
                </h4>
                <p className="text-stone-600 leading-relaxed">
                  The most common use. Sheep are small enough to fit under panels, don't chew on wires, and don't jump on structures. They get shade and better grass, while providing free landscaping.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-white/90 p-8 rounded-3xl border border-amber-100 shadow-sm hover:border-amber-400 hover:shadow-md transition-all">
                <h4 className="text-2xl font-bold text-stone-900 mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">02</span>
                  Poultry
                </h4>
                <p className="text-stone-600 leading-relaxed">
                  Chickens can roam freely under panels, which protect them from aerial predators like hawks. Crucial for mitigating heat stress during high temperatures from March to May.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="bg-white/90 p-8 rounded-3xl border border-sky-100 shadow-sm hover:border-sky-400 hover:shadow-md transition-all">
                <h4 className="text-2xl font-bold text-stone-900 mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700">03</span>
                  Cattle
                </h4>
                <p className="text-stone-600 leading-relaxed">
                  Requires panels raised higher on stilts. Testing shows dairy cow grazing under shade reduces heat stress and maintains milk production during heatwaves.
                </p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.4}>
            <div className="bg-white/85 p-8 rounded-3xl border border-emerald-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <h4 className="text-xl font-bold text-stone-900 mb-3">Addressing GMC's Poultry Challenges</h4>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Heat stress in birds poses a significant challenge for poultry farms, particularly during periods of high temperatures from March to May. Birds are highly sensitive to heat because they lack sweat glands. The construction of climate-smart cattle, poultry, and piggery sheds under solar canopies enhances productivity by providing adequate shelter. <span className="text-stone-500 italic">(Agriculture Resilience Plan, 2025)</span>
                </p>
              </div>
              <div className="shrink-0">
                <ShieldAlert className="w-16 h-16 text-emerald-600 opacity-70" />
              </div>
            </div>
          </FadeIn>
        </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="content-auto scroll-mt-28 border-t border-emerald-100 bg-gradient-to-br from-emerald-100 via-stone-50 to-amber-50 py-20 text-stone-900 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-16 md:grid-cols-2">
            <FadeIn>
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6">Let's build the future together.</h2>
                <p className="text-stone-600 text-lg mb-10 max-w-md">
                  Reach out to discuss how the Mindfulness Solar PV Canopy can transform your land-use strategy.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white border border-emerald-100 flex items-center justify-center shadow-sm">
                      <Phone className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <div className="text-sm text-emerald-700 mb-1">Phone</div>
                      <div className="text-lg font-medium text-stone-800">+975-17713997</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white border border-emerald-100 flex items-center justify-center shadow-sm">
                      <Mail className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <div className="text-sm text-emerald-700 mb-1">Email</div>
                      <div className="text-lg font-medium text-stone-800">12tdorji@gmail.com</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white border border-emerald-100 flex items-center justify-center shadow-sm">
                      <MapPin className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <div className="text-sm text-emerald-700 mb-1">Address</div>
                      <div className="text-lg font-medium text-stone-800">Thimphu, Bhutan</div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-white/90 p-8 md:p-10 rounded-3xl border border-emerald-100 shadow-lg">
                <form className="space-y-6" onSubmit={handleContactSubmit} noValidate>
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={contactForm.website}
                      onChange={handleContactChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-emerald-800">Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      aria-invalid={Boolean(contactErrors.name)}
                      aria-describedby={contactErrors.name ? 'contact-name-error' : undefined}
                      className={`w-full rounded-xl border px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 ${
                        contactErrors.name
                          ? 'border-red-300 bg-red-50 focus:ring-red-300'
                          : 'border-stone-200 bg-stone-50 focus:ring-emerald-500'
                      }`}
                      placeholder="Your name"
                    />
                    {contactErrors.name && (
                      <p id="contact-name-error" className="mt-2 text-sm text-red-600">
                        {contactErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-emerald-800">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      aria-invalid={Boolean(contactErrors.email)}
                      aria-describedby={contactErrors.email ? 'contact-email-error' : undefined}
                      className={`w-full rounded-xl border px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 ${
                        contactErrors.email
                          ? 'border-red-300 bg-red-50 focus:ring-red-300'
                          : 'border-stone-200 bg-stone-50 focus:ring-emerald-500'
                      }`}
                      placeholder="your@email.com"
                    />
                    {contactErrors.email && (
                      <p id="contact-email-error" className="mt-2 text-sm text-red-600">
                        {contactErrors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-2 block text-sm font-medium text-emerald-800">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      autoComplete="off"
                      value={contactForm.message}
                      onChange={handleContactChange}
                      aria-invalid={Boolean(contactErrors.message)}
                      aria-describedby={contactErrors.message ? 'contact-message-error' : undefined}
                      className={`w-full rounded-xl border px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 ${
                        contactErrors.message
                          ? 'border-red-300 bg-red-50 focus:ring-red-300'
                          : 'border-stone-200 bg-stone-50 focus:ring-emerald-500'
                      }`}
                      placeholder="How can we help?"
                    ></textarea>
                    {contactErrors.message && (
                      <p id="contact-message-error" className="mt-2 text-sm text-red-600">
                        {contactErrors.message}
                      </p>
                    )}
                  </div>
                  {contactStatus.message && (
                    <div
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        contactStatus.type === 'success'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-red-200 bg-red-50 text-red-700'
                      }`}
                      aria-live="polite"
                    >
                      {contactStatus.message}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="w-full rounded-xl bg-amber-500 py-4 text-lg font-bold text-amber-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-amber-300"
                  >
                    {isSubmittingContact ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </FadeIn>
          </div>
        </div>
        </section>

        {/* Footer */}
        <footer className="content-auto border-t border-stone-200 bg-gradient-to-br from-stone-100 via-emerald-50 to-amber-50 text-stone-900">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
            <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
            <div className="max-w-sm">
              <div className="text-2xl font-bold text-stone-900 tracking-tight">Solar PV Canopy</div>
              <p className="mt-4 text-stone-700 leading-relaxed">
                Building multi-output landscapes that support clean energy, resilient agriculture, and stronger communities.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-900">Quick Links</h3>
              <div className="mt-4 space-y-3">
                {footerLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block text-stone-800 transition-all hover:font-semibold hover:text-green-900 hover:underline underline-offset-4 decoration-green-900/70"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-900">Get In Touch</h3>
              <div className="mt-4 space-y-4 text-stone-800">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-emerald-900 shrink-0 mt-0.5" />
                  <span>+975-17713997</span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-emerald-900 shrink-0 mt-0.5" />
                  <span>12tdorji@gmail.com</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-900 shrink-0 mt-0.5" />
                  <span>Thimphu, Bhutan</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-stone-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-stone-700">
              &copy; {new Date().getFullYear()} Solar PV Canopy. All rights reserved.
            </p>
            <a href="#top" className="text-sm font-medium text-emerald-800 hover:text-green-900 transition-colors">
              Back to top
            </a>
          </div>
          </div>
        </footer>
      </div>
    </LazyMotion>
  );
}
