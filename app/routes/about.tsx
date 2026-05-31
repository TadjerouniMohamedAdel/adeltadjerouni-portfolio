import { LinksFunction, MetaFunction } from '@remix-run/node';
import { useState } from 'react';
import { Lightbox } from 'yet-another-react-lightbox';
import lightboxStylesImport from 'yet-another-react-lightbox/styles.css';

const lightboxStyles = lightboxStylesImport as unknown as string;
import aboutcss from '~/about.css';
import Navbar from '~/components/Navbar';
import ContactSection from '~/components/ContactSection';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: aboutcss },
  { rel: 'stylesheet', href: lightboxStyles },
];

export const meta: MetaFunction = () => {
  const title = 'Adel Mohamed Tadjerouni Aboutme';
  const description =
    'Adel Mohamed Tadjerouni personal website with projects, skills and contact informations';
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

const emploiPartnerAlt = 'adel mohamed tadjerouni emploi partner team';
const cleverzoneAlt = 'adel mohamed tadjerouni cleverzone team';
const scalexpAlt = 'adel mohamed tadjerouni scalexp team';

const careerImages = [
  { src: '/images/my-pic/IMAG0567.jpg', alt: emploiPartnerAlt },
  { src: '/images/my-pic/team2.jpeg', alt: 'Adel team gathering empoipartner' },
  {
    src: '/images/my-pic/IMG-5013a3de135d2e7f4646fef5664a4514-V.jpg',
    alt: emploiPartnerAlt,
  },
  {
    src: '/images/my-pic/IMG-627694dfb03e4ed4cbd98d4ff8c3d715-V.jpg',
    alt: emploiPartnerAlt,
  },
  {
    src: '/images/my-pic/IMG-fa7c22a758567f3cef94219a9ca5aa1c-V.jpg',
    alt: emploiPartnerAlt,
  },
  {
    src: '/images/my-pic/received_1011234773019364.jpeg',
    alt: emploiPartnerAlt,
  },
  {
    src: '/images/my-pic/received_1482586212122921.jpeg',
    alt: emploiPartnerAlt,
  },
  { src: '/images/my-pic/received_156444006248487.jpeg', alt: cleverzoneAlt },
  { src: '/images/my-pic/team3.jpeg', alt: 'Adel with team cleverzone' },
  { src: '/images/my-pic/received_1055727361953965.jpeg', alt: cleverzoneAlt },
  { src: '/images/my-pic/received_686373632739788.jpeg', alt: cleverzoneAlt },
  {
    src: '/images/my-pic/temp_image_20210217_093514_b822bc0f-8fc1-44c1-990f-497a079045d9.jpg',
    alt: cleverzoneAlt,
  },
  { src: '/images/my-pic/IMG_2574.HEIC', alt: scalexpAlt },
  { src: '/images/my-pic/scalpng.png', alt: scalexpAlt },
  { src: '/images/my-pic/IMG_9650.jpg', alt: scalexpAlt },
  { src: '/images/my-pic/team1.jpg', alt: 'Adel with team at work' },
  { src: '/images/my-pic/friends.jpg', alt: 'Adel with friends' },
  { src: '/images/my-pic/20240126_173019.jpg', alt: scalexpAlt },
  { src: '/images/my-pic/me2.jpg', alt: 'Adel portrait' },
  { src: '/images/my-pic/team5.jpg', alt: 'Adel with colleagues scalexp' },
  { src: '/images/my-pic/desk2.jpg', alt: "Adel's home office" },
  { src: '/images/my-pic/team3.jpg', alt: 'Adel team meeting' },
  { src: '/images/my-pic/me1.jpg', alt: 'Adel portrait two' },
];

export default function Index() {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  return (
    <>
      <Navbar />
      <main>
        <section className="aboutme">
          <div className="inner">
            <div className="content">
              <h2>Let’s discover more about Me</h2>
              <p>
                Since 2018, I have been working as a software developer. Over
                recent years I have developed a diverse range of skills that are
                essential for this role and that have enabled me to become a
                competent and knowledgeable asset to any team. I learned to take
                ownership of challenges and problems, being a good communicator
                and I always support my co-workers in the execution of their
                duties. In my last role my manager often praised me for the fact
                that I would always deliver excellent and fast customer requests
                by adding or updating features on our platform, which helped
                increase sales and it also helped to improve online reviews.
                Outside of work I like to go to the gym, play games and enjoy
                being close to my family and my friends. Those things that bring
                me happiness and increase my productivity and motivation while I
                am at work.
              </p>
            </div>
            <div className="imgBox">
              <img
                src="/images/my-pic/cabine2.jpg"
                alt="adel mohamed tadjerouni portrait"
              />
            </div>
          </div>
        </section>
        <section className="education">
          <div className="inner">
            <div className="imgBox">
              <img
                src="/images/my-pic/me1.jpg"
                alt="adel mohamed tadjerouni education"
              />
            </div>
            <div className="content">
              <h2>My Education</h2>
              <ul>
                <li>
                  <h3>Bachelor degree</h3>
                  <p>
                    Information systems and software engineering, University of
                    Algiers 1, (Algiers, Algeria) <br />
                    2015 - 2018
                  </p>
                </li>
                <li>
                  <h3>Baccalauréat 2015</h3>
                  <p>
                    Baccalauréat diploma math curriculum is an integrated
                    curriculum. Algebra, Geometry, Trigonometry, Probabilities
                    and Calculus courses are taught together and studied at
                    different depths throughout the four-year high school
                    curriculum.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </section>
        <section className="career">
          <div className="inner">
            <div className="content">
              <h2>My Personal Career Evolution</h2>
              <p>
                My first steps in the web development industry was in 2018. I
                worked as a full stack developer at Emploipartner.com which is
                an e-recruitment company. I had the responsibility to maintain
                and develop the internal applications for the company.
                <br />
                <br />
                Then after 2 years at Emploipartner, I moved to another exciting
                role as a Front end developer at cleverzone.io, in this company
                I worked only on the frontend part so I had the responsibilities
                of implementing user interfaces based on wireframe and screen
                designs provided by our designers, help the team by analyzing
                and correcting errors and being involved on the conception of
                new features.
                <br />
                <br />
                Now I am working with scaleXP as a frontend developer (since Sep
                2022), I am focusing on implementing changes to the frontend
                including ux improvements, tests, and adding new features to
                ScaleXP platform by collaborating with the product team to
                understand our customers’ needs.
              </p>
            </div>
            <div className="images">
              {careerImages.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`Open ${image.alt} in full screen`}
                >
                  <img src={image.src} alt={image.alt} loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </section>
        <Lightbox
          open={lightboxIndex >= 0}
          index={lightboxIndex < 0 ? 0 : lightboxIndex}
          close={() => setLightboxIndex(-1)}
          slides={careerImages}
        />
      </main>
      <ContactSection />
    </>
  );
}
