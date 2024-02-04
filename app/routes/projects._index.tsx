import projectcss from '../projects.css';
import Navbar from '~/components/Navbar';
import ProjectItem from '~/components/ProjectItem';
import ContactSection from '~/components/ContactSection';
import { LinksFunction, MetaFunction } from '@remix-run/node';
import { projects } from '~/content';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: projectcss },
];

export const meta: MetaFunction = () => {
  const title = 'Adel Tadjerouni Projects';
  const description =
    'Adel Tadjerouni personal website with projects, skills and contact informations';
  const previewImage = 'https://nagatodev.netlify.app/images/amt2.png';
  const previewImageAlt = 'Adel Tadjerouni website preview';
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
  return (
    <>
      <Navbar />
      <main className="projects-list">
        <h1>My Projects</h1>
        <div className="projects">
          {projects.map((project) => (
            <ProjectItem key={project.id} project={project} />
          ))}
        </div>

        <ContactSection />
      </main>
    </>
  );
}
