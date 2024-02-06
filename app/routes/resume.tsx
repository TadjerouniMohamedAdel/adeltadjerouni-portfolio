import resumecss from '~/resume.css';

import Navbar from '../components/Navbar';
import { LinksFunction, MetaFunction } from '@remix-run/node';
import ExperienceCarousel from '~/components/ExperienceCarousel';
import TechnoCarousel from '~/components/TechnoCarousel';
import ProjectItem from '~/components/ProjectItem';
import ContactSection from '~/components/ContactSection';
import { useState } from 'react';
import { experiences, projects } from '~/content';
import swipercss from 'swiper/css';
import swipercoverflowcss from 'swiper/css/effect-coverflow';
import swipernavigationcss from 'swiper/css/navigation';
import swipercardcss from 'swiper/css/effect-cards';
import experiencecarouselcss from '~/components/ExperienceCarousel/index.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: resumecss },
  { rel: 'stylesheet', href: swipercss },
  { rel: 'stylesheet', href: swipercoverflowcss },
  { rel: 'stylesheet', href: swipernavigationcss },
  { rel: 'stylesheet', href: swipercardcss },
  { rel: 'stylesheet', href: experiencecarouselcss },
];
export const meta: MetaFunction = () => {
  const title = 'Adel Tadjerouni Resume';
  const description =
    'Adel Mohamed Tadjerouni personal website with projects, skills and contact informations';
  const previewImage = 'https://nagatodev.netlify.app/images/amt2.png';
  const previewImageAlt = 'Adel Mohamed Tadjerouni website preview';
  const twitterUsername = '@TadjerouniAdel';

  return [
    {
      charSet: 'utf-8',
    },
    {
      name: 'viewport',
      content: 'width=device-width,initial-scale=1',
    },
    {
      title,
    },
    {
      name: 'description',
      content: description,
    },
    {
      name: 'twitter:card',
      content: 'summary',
    },
    {
      name: 'twitter:site',
      content: twitterUsername,
    },
    {
      name: 'twitter:creator',
      content: twitterUsername,
    },
    {
      name: 'twitter:title',
      content: title,
    },
    {
      name: 'twitter:description',
      content: description,
    },
    {
      name: 'twitter:image',
      content: previewImage,
    },
    {
      name: 'twitter:image:alt',
      content: previewImageAlt,
    },
    {
      property: 'og:title',
      content: title,
    },
    {
      property: 'og:description',
      content: description,
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:url',
      content: 'https://adeltadjerouni.com',
    },
    {
      property: 'og:image',
      content: previewImage,
    },
    {
      property: 'og:image:alt',
      content: previewImageAlt,
    },
    {
      property: 'og:image:width',
      content: '1190',
    },
    {
      property: 'og:image:height',
      content: '750',
    },
  ];
};
export default function Index() {
  const [currentExp, setCurrentExp] = useState(1);
  const experience = experiences[currentExp];
  const relatedProjects = projects.filter((project) =>
    experience.projects.includes(project.id)
  );
  return (
    <>
      <Navbar />
      <main className="resume">
        <h1>Brief about my experience</h1>
        <section className="experiences">
          <ExperienceCarousel
            currentExp={currentExp}
            setCurrentExp={setCurrentExp}
          />
          <div className="description">
            <h2>Mission :</h2>
            <ul>
              {experience.responsibilities.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </div>
          <div className="skills">
            <h2>Technologies :</h2>
            <TechnoCarousel
              key={experience.company}
              skills={experience.technologies}
            />
          </div>
          <div className="projects">
            <h2>Related Projects :</h2>
            <ul>
              {relatedProjects.map((project) => (
                <li key={project.id}>
                  <ProjectItem project={project} />
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section>
          <ContactSection />
        </section>
      </main>
    </>
  );
}
