import { LinksFunction, MetaFunction } from '@remix-run/node';
import { useState } from 'react';
import { Lightbox } from 'yet-another-react-lightbox';
import lightboxStylesImport from 'yet-another-react-lightbox/styles.css';
import aboutcss from '~/about.css';
import Navbar from '~/components/Navbar';

const lightboxStyles = lightboxStylesImport as unknown as string;

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: aboutcss },
  { rel: 'stylesheet', href: lightboxStyles },
];

export const meta: MetaFunction = () => {
  const title = 'Adel Mohamed Tadjerouni — About';
  const description =
    'Building for the web since 2018. Data-heavy B2B products across fintech, healthtech and HR tech.';
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

const portrait = {
  src: '/images/my-pic/cabine2.jpg',
  alt: 'Adel Mohamed Tadjerouni portrait',
};

const gallery = [
  {
    src: '/images/my-pic/team5.jpg',
    alt: 'ScaleXP team remote meetup',
    caption: 'ScaleXP team · remote meetup',
    wide: true,
  },
  {
    src: '/images/my-pic/desk2.jpg',
    alt: "Adel's desk setup",
    caption: 'Desk setup',
    wide: false,
  },
  {
    src: '/images/my-pic/team3.jpeg',
    alt: 'Cleverzone office in Algiers',
    caption: 'Cleverzone office · Algiers',
    wide: false,
  },
  {
    src: '/images/my-pic/team2.jpeg',
    alt: 'EmploiPartner team in 2019',
    caption: 'EmploiPartner team · 2019',
    wide: false,
  },
  {
    src: '/images/my-pic/IMAG0567.jpg',
    alt: 'Graduation at University of Algiers 1 in 2018',
    caption: 'Graduation · Algiers 1, 2018',
    wide: false,
  },
  {
    src: '/images/my-pic/PXL_20230925_090953627.jpg',
    alt: 'Conference and meetup',
    caption: 'Conference / meetup',
    wide: false,
  },
  {
    src: '/images/my-pic/friends.jpg',
    alt: 'Weekend with family and friends',
    caption: 'Weekend · family',
    wide: true,
  },
];

const facts = [
  ['Based', 'Algiers, Algeria'],
  ['Experience', '7+ years'],
  ['Currently', 'ScaleXP'],
];

const interests = ['Fitness', 'Gaming', 'Family'];

const languages = [
  ['Arabic', 'Native'],
  ['French', 'Fluent'],
  ['English', 'Fluent'],
];

const slides = [portrait, ...gallery];

export default function About() {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  return (
    <div className="page">
      <Navbar />
      <div className="about-wrap">
        <section className="about-grid">
          <button
            type="button"
            className="about-portrait"
            onClick={() => setLightboxIndex(0)}
            aria-label="Open portrait in full screen"
          >
            <img src={portrait.src} alt={portrait.alt} />
          </button>

          <div className="about-intro">
            <span className="eyebrow">About me</span>
            <h1 className="about-title">Building for the web since&nbsp;2018.</h1>
            <p className="about-lead">
              I build data-heavy B2B products — fintech, healthtech, HR tech. I
              started across the full stack at EmploiPartner, narrowed into
              frontend work at Cleverzone, and now own features end to end at
              ScaleXP, whose reporting platform serves 1,200+ companies.
            </p>
            <p className="about-body">
              What has stayed constant is caring about the details other people
              skip: how fast a page feels once there is real data in it, whether
              a form works from the keyboard, what the screen does when the
              request fails. I would rather over-communicate than leave someone
              guessing.
            </p>

            <div className="about-facts">
              {facts.map(([label, value]) => (
                <div key={label} className="about-fact">
                  <span className="eyebrow">{label}</span>
                  <span className="about-fact__value">{value}</span>
                </div>
              ))}
            </div>

            <div className="about-interests">
              <span className="eyebrow">Off the clock</span>
              {interests.map((interest) => (
                <span key={interest} className="tag">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="about-photos">
          <div className="about-photos__head">
            <div className="about-photos__title">
              <span className="eyebrow">Photos</span>
              <h2 className="about-heading">
                The people and places behind the CV
              </h2>
            </div>
            <span className="about-photos__note rail-hide">
              7 slots · click any to enlarge
            </span>
          </div>

          <div className="gallery">
            {gallery.map((photo, index) => (
              <figure
                key={photo.src}
                className={`gallery-item ${photo.wide ? 'wide' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index + 1)}
                  aria-label={`Open ${photo.caption} in full screen`}
                >
                  <img src={photo.src} alt={photo.alt} loading="lazy" />
                </button>
                <figcaption>{photo.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="field about-field">
          <span className="eyebrow">Education</span>
          <div className="about-edu">
            <div className="about-edu__card">
              <span className="about-edu__years">2015 — 2018</span>
              <span className="about-edu__degree">
                Bachelor’s, Information Systems &amp; Software Engineering
              </span>
              <span className="about-edu__school">University of Algiers 1</span>
            </div>
            <div className="about-lang">
              <span className="eyebrow">Languages</span>
              {languages.map(([lang, level]) => (
                <div key={lang} className="about-lang__row">
                  <span className="about-lang__name">{lang}</span>
                  <span className="about-lang__level">{level}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex < 0 ? 0 : lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={slides}
      />
    </div>
  );
}
