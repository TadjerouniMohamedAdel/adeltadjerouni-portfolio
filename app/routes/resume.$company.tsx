import { LinksFunction, LoaderFunctionArgs, MetaFunction, json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import resumecss from '~/resume.css';
import Navbar from '~/components/Navbar';
import { resumeExperiences, site } from '~/content';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: resumecss },
];

export const loader = ({ params }: LoaderFunctionArgs) => {
  const index = resumeExperiences.findIndex((exp) => exp.slug === params.company);
  if (index < 0) {
    throw new Response('Not Found', { status: 404 });
  }
  return json({ index });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const experience = data ? resumeExperiences[data.index] : undefined;
  const title = experience
    ? `Resume — ${experience.company} · Adel Tadjerouni`
    : 'Resume — Adel Tadjerouni';
  const description = experience
    ? `${experience.role} at ${experience.company}. ${experience.summary.replace(/\*\*/g, '')}`
    : 'Adel Mohamed Tadjerouni resume';
  const previewImage = 'https://adeltadjerouni.com/favicon.png';

  return [
    { charSet: 'utf-8' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
    { title },
    { name: 'description', content: description },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: previewImage },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: `https://adeltadjerouni.com/resume/${experience?.slug ?? ''}` },
    { property: 'og:image', content: previewImage },
  ];
};

const renderRich = (text: string) =>
  text.split('**').map((part, i) =>
    i % 2 === 1 ? <b key={i}>{part}</b> : <span key={i}>{part}</span>
  );

const PinIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ArrowLeft = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19 12H6" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

const ArrowRight = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h13" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default function ResumeCompany() {
  const { index } = useLoaderData<typeof loader>();
  const experience = resumeExperiences[index];
  const previous = index > 0 ? resumeExperiences[index - 1] : null;
  const next = index < resumeExperiences.length - 1 ? resumeExperiences[index + 1] : null;

  return (
    <div className="page">
      <Navbar />
      <div className="resume-wrap">
        <div className="resume-grid resume-grid--fill">
          <aside className="resume-rail-wrap">
            <div className="rail-hide">
              <span className="eyebrow">Experience</span>
            </div>
            <div className="rail">
              {resumeExperiences.map((exp) => {
                const active = exp.slug === experience.slug;
                return (
                  <Link
                    key={exp.slug}
                    to={`/resume/${exp.slug}`}
                    aria-current={active ? 'page' : undefined}
                    className={`rail-item ${active ? 'is-active' : ''}`}
                  >
                    <span className="rail-item__top">
                      <span className="rail-item__order">{exp.order}</span>
                      <span className="rail-item__dates">{exp.dates}</span>
                    </span>
                    <span className="rail-item__company">{exp.company}</span>
                    <span className="rail-item__role">{exp.role}</span>
                    <span className="rail-item__loc">
                      <PinIcon />
                      {exp.location}
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className="rail-hide rail-divider" />
            <a
              href={site.resumePdf}
              download
              className="btn-ghost rail-hide rail-download"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v12" />
                <path d="m7 11 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
              Download résumé
            </a>
            <span className="rail-hide rail-note">3 roles · 7+ years</span>
          </aside>

          <article className="resume-article">
            <div className="resume-crumb">
              adeltadjerouni.com<span className="resume-crumb__sep"> / </span>resume
              <span className="resume-crumb__sep"> / </span>
              <span className="resume-crumb__current">{experience.slug}</span>
            </div>

            <div className="resume-header">
              <div className="resume-logo">
                <img src={experience.logo} alt={`${experience.company} logo`} />
              </div>
              <div className="resume-header__title">
                <h1 className="resume-company">{experience.company}</h1>
                <p className="resume-role">{experience.role}</p>
                <p className="resume-tagline">{experience.tagline}</p>
              </div>
              <div className="resume-header__meta">
                <span className="resume-chip">{experience.dates}</span>
                <span className="resume-chip resume-chip--icon">
                  <PinIcon />
                  {experience.location}
                </span>
                {experience.current && (
                  <span className="resume-badge">
                    <span className="resume-badge__dot" />
                    Current
                  </span>
                )}
              </div>
            </div>

            <div className="resume-divider" />

            <div className="field resume-field">
              <span className="eyebrow resume-field__label">The role</span>
              <p className="resume-summary">{renderRich(experience.summary)}</p>

              <span className="eyebrow resume-field__label">What I did</span>
              <ul className="resume-bullets">
                {experience.bullets.map((bullet) => (
                  <li key={bullet}>
                    <span className="resume-bullet__dot" />
                    <span className="resume-bullet__text">
                      {renderRich(bullet)}
                    </span>
                  </li>
                ))}
              </ul>

              <span className="eyebrow resume-field__label">Stack</span>
              <div className="resume-stack">
                {experience.stack.map((tech) => (
                  <span key={tech} className="tag">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="pager resume-pager">
              {previous ? (
                <Link to={`/resume/${previous.slug}`} className="pager-card">
                  <span className="pager-card__label">
                    <ArrowLeft />
                    Previous role
                  </span>
                  <span className="pager-card__title">{previous.company}</span>
                </Link>
              ) : (
                <Link to="/" className="pager-card">
                  <span className="pager-card__label">
                    <ArrowLeft />
                    Back to
                  </span>
                  <span className="pager-card__title">Home</span>
                </Link>
              )}
              {next ? (
                <Link
                  to={`/resume/${next.slug}`}
                  className="pager-card pager-card--right"
                >
                  <span className="pager-card__label">
                    Next role
                    <ArrowRight />
                  </span>
                  <span className="pager-card__title">{next.company}</span>
                </Link>
              ) : (
                <a
                  href={site.resumePdf}
                  download
                  className="pager-card pager-card--right"
                >
                  <span className="pager-card__label">
                    Everything at once
                    <ArrowRight />
                  </span>
                  <span className="pager-card__title">Download résumé</span>
                </a>
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
