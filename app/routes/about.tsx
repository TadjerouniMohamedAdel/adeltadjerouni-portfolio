import { LinksFunction, MetaFunction } from '@remix-run/node';
import aboutcss from '~/about.css';
import Navbar from '~/components/Navbar';
import ContactSection from '~/components/ContactSection';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: aboutcss },
];

export const meta: MetaFunction = () => {
  const title = 'Adel Mohamed Tadjerouni Aboutme';
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
      <main>
        <section className="aboutme">
          <div className="content">
            <h2>Let’s discover more about Me</h2>
            <p>
              Since 2018, I have been working as a software developer. Over
              recent years I have developed a diverse range of skills that are
              essential for this role and that have enabled me to become a
              competent and knowledgeable asset to any team. I learned to take
              ownership of challenges and problems,being a good communicator and
              I always support my co-workers in the execution of their duties.
              In my last role my manager often praised me for the fact that I
              would always deliver excellent and fast customer requests by
              adding or updating features on our platform, which helped increase
              sales and it also helped to improve online reviews. Outside of
              work I like to go to the gym,play games and enjoy being close to
              my family and my friends.Those things that bring me happiness and
              increase my productivity and motivation while I am at work.
            </p>
          </div>
          <div className="imgBox">
            <img
              src="/images/my-pic/cabine2.jpg"
              alt="adel mohamed tadjerouni education"
            />
          </div>
        </section>
        <section className="education">
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
                  curriculum. Algebra, Geometry, Trigonometry, Probabilities and
                  Calculus courses are taught together and studied at different
                  depths throughout the four-year high school curriculum.
                </p>
              </li>
            </ul>
          </div>
        </section>
        <section className="career">
          <div className="content">
            <h2>My Personal Career Evolution</h2>
            <p>
              My first steps in the web development industry was in 2018. I
              worked as a full stack developer at Emploipartner.com which is an
              e-recruitment company. I had the responsibility to maintain and
              develop the internal applications for the company.
              <br />
              <br />
              Then after 2 years at Emploipartner,i moved to another exciting
              role as a Front end developer at cleverzone.io, in this company i
              worked only on the frontend part so i had the responsibilities of
              implementing user interfaces based on wireframe and screen designs
              provided by our designers,help the team by analyzing and correct
              errors and being involved on the conception of new features.
              <br />
              <br />
              Now I am working with scaleXP as a frontend developer (since Sep
              2022), am focusing on implementing changes to the frontend
              including ux improvements,tests, and adding new features to
              ScaleXP platform by collaborating with the product team to
              understand our customers needs.
            </p>
          </div>
          <div className="images">
            <div>
              <img
                alt="adel mohamed tadjerouni carrer"
                src="/images/my-pic/team1.jpg"
              />
            </div>
            <div>
              <img
                alt="adel mohamed tadjerouni career"
                src="/images/my-pic/team3.jpg"
              />
            </div>
            <div>
              <img
                alt="adel mohamed tadjerouni career"
                src="/images/my-pic/team5.jpg"
              />
            </div>
            <div>
              <img
                alt="adel mohamed tadjerouni career"
                src="/images/my-pic/team2.jpeg"
              />
            </div>
            <div>
              <img
                alt="adel mohamed tadjerouni career"
                src="/images/my-pic/friends.jpg"
              />
            </div>
          </div>
        </section>
      </main>
      <ContactSection />
    </>
  );
}
