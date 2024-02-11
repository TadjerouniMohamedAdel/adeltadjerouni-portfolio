import { LinksFunction, MetaFunction } from '@remix-run/node';
import indexcss from '~/index.css';
import Navbar from '../components/Navbar';
import swipercss from 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';
import ProjectItem from '~/components/ProjectItem';
// import ContactSection from '~/components/ContactSection';
import LinkButton from '~/components/LinkButton';
import { Autoplay, FreeMode } from 'swiper/modules';
import { projects } from '../content';
import ContactSection from '~/components/ContactSection';
import Intro from '~/components/Intro';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: indexcss },
  { rel: 'stylesheet', href: swipercss },
];
export function headers({
  loaderHeaders,
  parentHeaders,
}: {
  loaderHeaders: Headers;
  parentHeaders: Headers;
}) {
  console.log(
    'This is an example of how to set caching headers for a route, feel free to change the value of 60 seconds or remove the header'
  );
  return {
    // This is an example of how to set caching headers for a route
    // For more info on headers in Remix, see: https://remix.run/docs/en/v1/route/headers
    'Cache-Control': 'public, max-age=60, s-maxage=60',
  };
}
export const meta: MetaFunction = () => {
  const title = 'Adel Mohamed Tadjerouni Portfolio';
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

export default function Index() {
  return (
    <>
      <Navbar />
      <main className="home">
        <section className="presentation">
          <div className="content">
            <h1>I’m Adel Tadjerouni. A Web Developer From Algeria</h1>
            <p>
              I am a very motivated, conscientious and competent developer with
              extensive expertise in web development. With proven experience and
              accomplishments, I can provide positivity, support and a creative
              mindset for any team.
            </p>
            <div className="links">
              <LinkButton
                label="See My Projects"
                to="/projects"
                rightIcon="bx-right-arrow-alt"
              />
              <LinkButton
                label="More about me"
                to="/about"
                leftIcon="bxs-right-arrow"
                color="transparent"
              />
            </div>
          </div>
          <div className="imgBox">
            <Intro />
          </div>
        </section>
        <section className="latest-projects">
          <h2>My latest Projects</h2>
          <div className="projects">
            {projects.slice(0, 2).map((project) => (
              <ProjectItem project={project} key={project.id} />
            ))}
          </div>
          <LinkButton to="/projects" label="See more projects" />
        </section>
        <section className="companies">
          <h2>Companies that I worked with:</h2>
          <ul>
            <li>
              <a href="https://www.bea.dz/" target="_blank" rel="noreferrer">
                <img
                  src="/images/bea_logo.png"
                  alt={`adel mohamed tadjerouni companies`}
                />
              </a>
            </li>
            <li>
              <a
                href="https://www.emploipartner.com/en/"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="/images/ep_logo.png"
                  alt={`adel mohamed tadjerouni companies`}
                />
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/company/cleverzoneio/about/"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="/images/cleverzone.png"
                  alt={`adel mohamed tadjerouni companies`}
                />
              </a>
            </li>
            <li>
              <a
                href="https://www.scalexp.com/"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="/images/scalexp.png"
                  alt={`adel mohamed tadjerouni companies`}
                />
              </a>
            </li>
          </ul>
        </section>
        <section className="technologies">
          <div className="content">
            <h2>Most used technologies</h2>
            <p>
              I am passionate about web development and in particular the
              frontend. Am not limited to a technology, a framework or
              libraries, each solution has its own context and a specific usage
              case. But if you ask me what I like most, I would say
              Typescript/Javascript and React Ecosystem.
            </p>
            <LinkButton to="/resume" label="check my resume" />
          </div>
          <div className="swiper-group">
            <Swiper
              grabCursor={true}
              direction="vertical"
              pagination={false}
              modules={[Autoplay, FreeMode]}
              autoplay={{ delay: 0 }}
              spaceBetween={20}
              speed={3000}
              loop
              slidesPerView="auto"
              className="swiper-technologies"
            >
              <SwiperSlide>
                <img
                  src="/images/skills/react-color.svg"
                  alt="skill pic adel mohamed tadjerouni"
                />
                <span>React</span>
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/images/skills/nextjs-color.svg"
                  alt="skill pic adel mohamed tadjerouni"
                />
                <span>Nextjs</span>
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/images/skills/remix-color.svg"
                  alt="skill pic adel mohamed tadjerouni"
                />
                <span>Remixjs</span>
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/images/skills/astro-color.svg"
                  alt="skill pic adel mohamed tadjerouni"
                />
                <span>Astro</span>
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/images/skills/graphql-color.svg"
                  alt="skill pic adel mohamed tadjerouni"
                />
                <span>GraphQL</span>
              </SwiperSlide>
            </Swiper>
            <Swiper
              grabCursor={true}
              direction="vertical"
              pagination={false}
              modules={[Autoplay, FreeMode]}
              autoplay={{ delay: 0, reverseDirection: true }}
              spaceBetween={20}
              speed={3000}
              loop
              slidesPerView="auto"
              className="swiper-technologies"
            >
              <SwiperSlide>
                <img
                  src="/images/skills/css3-color.svg"
                  alt="skill pic adel mohamed tadjerouni"
                />
                <span>CSS3</span>
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/images/skills/sass-color.svg"
                  alt="skill pic adel mohamed tadjerouni"
                />
                <span>Sass</span>
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/images/skills/ant-design-color.svg"
                  alt="skill pic adel mohamed tadjerouni"
                />
                <span>Ant design</span>
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/images/skills/bootstrap-color.svg"
                  alt="skill pic adel mohamed tadjerouni"
                />
                <span>Bootstrap</span>
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/images/skills/mui-color.svg"
                  alt="skill pic adel mohamed tadjerouni"
                />
                <span>MUI</span>
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/images/skills/tailwindcss-color.svg"
                  alt="skill pic adel mohamed tadjerouni"
                />
                <span>Tailwind</span>
              </SwiperSlide>
            </Swiper>
            <Swiper
              grabCursor={true}
              direction="vertical"
              pagination={false}
              modules={[Autoplay, FreeMode]}
              autoplay={{ delay: 0 }}
              spaceBetween={20}
              speed={3000}
              loop
              slidesPerView="auto"
              className="swiper-technologies"
            >
              <SwiperSlide>
                <img
                  src="/images/skills/typescript-color.svg"
                  alt="skill pic adel mohamed tadjerouni"
                />
                <span>Typescript</span>
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/images/skills/javascript-color.svg"
                  alt="skill pic adel mohamed tadjerouni"
                />
                <span>Javascript</span>
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/images/skills/nodedotjs-color.svg"
                  alt="skill pic adel mohamed tadjerouni"
                />
                <span>NodeJs</span>
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/images/skills/php-color.svg"
                  alt="skill pic adel mohamed tadjerouni"
                />
                <span>PHP</span>
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/images/skills/symfony-white.svg"
                  alt="skill pic adel mohamed tadjerouni"
                />
                <span>Symfony</span>
              </SwiperSlide>
            </Swiper>
          </div>
        </section>
      </main>
      <ContactSection />
    </>
  );
}
