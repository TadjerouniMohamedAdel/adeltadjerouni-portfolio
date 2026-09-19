import Navbar from '~/components/Navbar';
import projectidcss from '~/project_id.css';
import { Link, MetaFunction, useLoaderData } from '@remix-run/react';
import swipercss from 'swiper/css';
import swiperpaginationcss from 'swiper/css/pagination';
import swipernavigationcss from 'swiper/css/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { LinksFunction, LoaderFunctionArgs, json } from '@remix-run/node';
import { projects } from '~/content';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: projectidcss },
  { rel: 'stylesheet', href: swipercss },
  { rel: 'stylesheet', href: swiperpaginationcss },
  { rel: 'stylesheet', href: swipernavigationcss },
];

export const loader = ({ params }: LoaderFunctionArgs) => {
  const project = projects.find((proj) => proj.id === params.id);
  if (!project) {
    throw new Response('Not Found', { status: 404 });
  }
  return json({ project });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const project = data?.project;
  const title = project
    ? `${project.name} — Adel Tadjerouni`
    : 'Projects — Adel Tadjerouni';
  const description = project?.short_description ?? 'Adel Mohamed Tadjerouni projects';
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
    { property: 'og:url', content: 'https://adeltadjerouni.com' },
    { property: 'og:image', content: previewImage },
  ];
};

export default function ProjectDetail() {
  const { project } = useLoaderData<typeof loader>();

  return (
    <div className="page">
      <Navbar />
      <div className="project-wrap">
        <Link to="/projects" className="project-back">
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
          All projects
        </Link>

        <header className="project-header">
          <div className="project-header__logo">
            <img
              src={project.project_logo}
              alt={`${project.name} logo`}
            />
          </div>
          <div className="project-header__title">
            <span className="project-header__type">{project.type}</span>
            <h1 className="project-header__name">{project.name}</h1>
            <p className="project-header__short">{project.short_description}</p>
          </div>
        </header>

        <section className="project-preview">
          <Swiper
            grabCursor
            modules={[Autoplay, Pagination, Navigation]}
            autoplay={{ delay: 5000 }}
            spaceBetween={24}
            speed={500}
            loop
            navigation
            pagination={{ dynamicBullets: true }}
            slidesPerView={1}
            className="project-swiper"
          >
            {project.screens.map((screen, index) => (
              <SwiperSlide key={`${screen}-${index}`}>
                <img src={screen} alt={`${project.name} screen ${index + 1}`} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        <section className="project-body">
          <div className="project-desc">
            <span className="eyebrow">About the project</span>
            <p>{project.description}</p>
          </div>
          <aside className="project-side">
            <div className="project-info">
              <span className="eyebrow">Project info</span>
              <div className="project-info__row">
                <div className="project-info__logo">
                  <img
                    src={project.company_logo}
                    alt={`${project.company} logo`}
                  />
                </div>
                <div className="project-info__meta">
                  <span className="project-info__company">{project.company}</span>
                  <span className="project-info__date">{project.date}</span>
                  {project.role && (
                    <span className="project-info__role">{project.role}</span>
                  )}
                </div>
              </div>
            </div>
            {(project.code_link || project.demo_link) && (
              <div className="project-links">
                <span className="eyebrow">Links</span>
                <div className="project-links__list">
                  {project.code_link && (
                    <a
                      href={project.code_link}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost"
                    >
                      Source code
                    </a>
                  )}
                  {project.demo_link && (
                    <a
                      href={project.demo_link}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary"
                    >
                      Live demo
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>
        </section>

        <section className="project-tech">
          <span className="eyebrow">Technologies</span>
          <div className="project-tech__list">
            {project.technologies.map((techno) => (
              <span key={techno} className="tag">
                {techno}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
