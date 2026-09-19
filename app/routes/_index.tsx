import { LinksFunction, MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import homecss from '~/home.css';
import Navbar from '~/components/Navbar';
import { site } from '~/content';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: homecss }];

export const meta: MetaFunction = () => {
  const title = 'Adel Mohamed Tadjerouni — Frontend Engineer';
  const description =
    'Frontend engineer with 7+ years across fintech, healthtech and HR tech. I build data-heavy products that stay fast.';
  const previewImage = 'https://adeltadjerouni.com/favicon.png';
  const previewImageAlt = 'Adel Mohamed Tadjerouni website preview';
  const twitterUsername = '@TadjerouniAdel';

  return [
    { charSet: 'utf-8' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
    { title },
    { name: 'description', content: description },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:site', content: twitterUsername },
    { name: 'twitter:creator', content: twitterUsername },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: previewImage },
    { name: 'twitter:image:alt', content: previewImageAlt },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://adeltadjerouni.com' },
    { property: 'og:image', content: previewImage },
    { property: 'og:image:alt', content: previewImageAlt },
    { property: 'og:image:width', content: '1190' },
    { property: 'og:image:height', content: '750' },
  ];
};

const workingWith = ['JavaScript', 'React', 'PHP', 'Python'];

export default function Index() {
  return (
    <div className="page">
      <Navbar />
      <div className="hero-wrap">
        <div className="track hero-grid">
          <div className="hero-copy">
            <div className="hero-availability">
              <span className="hero-availability__dot" />
              <span className="hero-availability__label">Open to new work</span>
            </div>

            <h1 className="hero-title">
              I build data-heavy products that stay&nbsp;fast.
            </h1>

            <p className="hero-sub">
              Frontend engineer with 7+ years across fintech, healthtech and HR
              tech. At <span className="hero-strong">ScaleXP</span> I own
              features end to end — React in front, Python/Django behind — for a
              reporting platform used by{' '}
              <span className="hero-strong">1,200+ companies</span>.
            </p>

            <div className="hero-ctas">
              <Link to="/projects" className="btn-primary hero-cta">
                See my projects
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h13" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <a href={site.resumePdf} download className="btn-ghost hero-cta">
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
            </div>

            <div className="hero-working">
              <span className="hero-working__label">Working with</span>
              <div className="hero-working__tags">
                {workingWith.map((tech) => (
                  <span key={tech} className="tag">
                    {tech}
                  </span>
                ))}
                <span className="tag muted">and more</span>
              </div>
            </div>
          </div>

          <div className="editor">
            <div className="editor__tabs">
              <div className="editor__tab editor__tab--active">
                <span className="editor__tab-icon editor__tab-icon--teal">
                  TS
                </span>
                <span className="editor__tab-name">adel.ts</span>
              </div>
              <div className="editor__tab rail-hide">
                <span className="editor__tab-icon editor__tab-icon--amber">
                  {'{ }'}
                </span>
                <span className="editor__tab-name editor__tab-name--dim">
                  stack.json
                </span>
              </div>
            </div>

            <div className="editor__body">
              <div className="editor__gutter">
                {Array.from({ length: 15 }, (_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
              <div className="editor__code">
                <div>
                  <span className="tok-kw">const</span>{' '}
                  <span className="tok-var">adel</span>
                  <span className="tok-punc">:</span>{' '}
                  <span className="tok-type">Engineer</span>{' '}
                  <span className="tok-punc">= {'{'}</span>
                </div>
                <div>
                  {'  '}
                  <span className="tok-prop">name</span>
                  <span className="tok-punc">:</span>
                  {'       '}
                  <span className="tok-str">&quot;Adel Mohamed Tadjerouni&quot;</span>
                  <span className="tok-punc">,</span>
                </div>
                <div>
                  {'  '}
                  <span className="tok-prop">role</span>
                  <span className="tok-punc">:</span>
                  {'       '}
                  <span className="tok-str">&quot;Frontend Engineer&quot;</span>
                  <span className="tok-punc">,</span>
                </div>
                <div>
                  {'  '}
                  <span className="tok-prop">based</span>
                  <span className="tok-punc">:</span>
                  {'      '}
                  <span className="tok-str">&quot;Algiers, Algeria&quot;</span>
                  <span className="tok-punc">,</span>
                </div>
                <div>
                  {'  '}
                  <span className="tok-prop">experience</span>
                  <span className="tok-punc">:</span>{' '}
                  <span className="tok-str">&quot;7+ years&quot;</span>
                  <span className="tok-punc">,</span>
                </div>
                <div> </div>
                <div>
                  {'  '}
                  <span className="tok-prop">stack</span>
                  <span className="tok-punc">: [</span>
                  <span className="tok-str">&quot;TypeScript&quot;</span>
                  <span className="tok-punc">,</span>{' '}
                  <span className="tok-str">&quot;React&quot;</span>
                  <span className="tok-punc">,</span>{' '}
                  <span className="tok-str">&quot;Python&quot;</span>
                  <span className="tok-punc">],</span>
                </div>
                <div> </div>
                <div>
                  {'  '}
                  <span className="tok-prop">now</span>
                  <span className="tok-punc">: {'{'}</span>
                </div>
                <div>
                  {'    '}
                  <span className="tok-prop">company</span>
                  <span className="tok-punc">:</span>
                  {'  '}
                  <span className="tok-str">&quot;ScaleXP&quot;</span>
                  <span className="tok-punc">,</span>
                </div>
                <div>
                  {'    '}
                  <span className="tok-prop">domain</span>
                  <span className="tok-punc">:</span>
                  {'   '}
                  <span className="tok-str">&quot;financial reporting&quot;</span>
                  <span className="tok-punc">,</span>
                </div>
                <div>
                  {'    '}
                  <span className="tok-prop">serving</span>
                  <span className="tok-punc">:</span>
                  {'  '}
                  <span className="tok-str">&quot;1,200+ companies&quot;</span>
                  <span className="tok-punc">,</span>
                </div>
                <div>
                  {'  '}
                  <span className="tok-punc">{'},'}</span>
                </div>
                <div>
                  <span className="tok-punc">{'};'}</span>
                </div>
                <div> </div>
                <div>
                  <span className="tok-kw">export default</span>{' '}
                  <span className="tok-var">adel</span>
                  <span className="tok-punc">;</span>
                  <span className="editor__caret">|</span>
                </div>
              </div>
            </div>

            <div className="editor__foot">
              <div className="editor__foot-left">
                <span className="editor__branch">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4FC1A6"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="6" cy="6" r="3" />
                    <circle cx="6" cy="18" r="3" />
                    <path d="M6 9v6" />
                    <circle cx="18" cy="8" r="3" />
                    <path d="M18 11v1a3 3 0 0 1-3 3H9" />
                  </svg>
                  main
                </span>
                <span className="editor__lang rail-hide">TypeScript</span>
              </div>
              <span className="editor__meta">Algiers · UTC+1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
