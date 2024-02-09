import Navbar from '~/components/Navbar';
import projectidcss from '../project_id.css';
import ContactSection from '~/components/ContactSection';
import { MetaFunction, useLoaderData } from '@remix-run/react';
import TechnoCarousel from '~/components/TechnoCarousel';
import swipercss from 'swiper/css';
import 'swiper/css/pagination';

import { Swiper, SwiperSlide } from 'swiper/react';
import swipercoverflowcss from 'swiper/css/effect-coverflow';
import swipernavigationcss from 'swiper/css/navigation';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { LinksFunction, LoaderFunctionArgs, json } from '@remix-run/node';
import { projects } from '~/content';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: projectidcss },
  { rel: 'stylesheet', href: swipercss },
  { rel: 'stylesheet', href: swipercoverflowcss },
  { rel: 'stylesheet', href: swipernavigationcss },
];
export const loader = async ({ params }: LoaderFunctionArgs) => {
  console.log(params.id);
  return json({ project: projects.find((proj) => proj.id === params.id)! });
};
export const meta: MetaFunction = () => {
  const title = 'Adel Mohamed Tadjerouni Projects';
  const description =
    'Adel Mohamed Tadjerouni personal website with projects, skills and contact informations';
  const previewImage = 'https://adeltadjerouni.com/favicon.png';
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
const ProjectItemPage = () => {
  const { project } = useLoaderData<typeof loader>();

  return (
    <>
      <Navbar />
      <main className="project-id">
        <h1>
          <div className="project-image">
            <img src={project.project_logo} alt="project logo" />
          </div>
          <span>{project.name}</span>
        </h1>
        <section className="preview">
          <Swiper
            grabCursor={true}
            modules={[Autoplay, Pagination, Navigation]}
            autoplay={{ delay: 5000 }}
            spaceBetween={50}
            speed={500}
            loop
            navigation
            pagination={{
              dynamicBullets: true,
            }}
            slidesPerView={1}
            className="screen-swiper"
          >
            {project?.screens.map((screen, index) => (
              <SwiperSlide key={index}>
                <img src={screen} alt="screen project" />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
        <section className="content">
          <div className="description">
            <h3>Brief Description</h3>
            <p>{project?.description}</p>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 30,
            }}
          >
            <div className="info">
              <h3>Project Info</h3>
              <div>
                <div className="project-logo">
                  <img src={project.company_logo} alt="" />
                </div>
                <div className="project-info-content">
                  <span>{project.company}</span>
                  <span>{project.date}</span>
                  <span>{project.role}</span>
                </div>
              </div>
            </div>
            {project.code_link ||
              (project.demo_link && (
                <div className="links">
                  <h3>Project links </h3>
                  <ul>
                    {project.code_link && (
                      <li>
                        <a
                          rel="noreferrer"
                          href={project.code_link}
                          target="_blank"
                        >
                          Code source
                        </a>
                      </li>
                    )}
                    {project.demo_link && (
                      <li>
                        <a
                          rel="noreferrer"
                          href={project.demo_link}
                          target="_blank"
                        >
                          Live Demo
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
          </div>
        </section>
        <section className="technologies">
          <h3>Technologies:</h3>
          <TechnoCarousel skills={project.technologies} />
        </section>
      </main>
      <ContactSection />
    </>
  );
};

export default ProjectItemPage;
