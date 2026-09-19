import { LinksFunction, MetaFunction } from '@remix-run/node';
import projectscss from '~/projects.css';
import Navbar from '~/components/Navbar';
import ProjectItem from '~/components/ProjectItem';
import { projects } from '~/content';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: projectscss },
];

export const meta: MetaFunction = () => {
  const title = 'Adel Mohamed Tadjerouni — Projects';
  const description =
    'Selected projects across fintech, healthtech and HR tech, from ScaleXP to EmploiPartner.';
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

export default function Projects() {
  return (
    <div className="page">
      <Navbar />
      <div className="projects-wrap">
        <header className="projects-head">
          <span className="eyebrow">Projects</span>
          <h1 className="projects-title">Things I have shipped</h1>
          <p className="projects-lead">
            A selection of the products I have built and helped build across
            fintech, healthtech and HR tech.
          </p>
        </header>
        <div className="projects-list">
          {projects.map((project) => (
            <ProjectItem key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
