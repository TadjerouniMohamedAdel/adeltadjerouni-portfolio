import 'swiper/css';
import './index.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/effect-cards';

import {
  EffectCoverflow,
  Pagination,
  Navigation,
  EffectCards,
} from 'swiper/modules';

import 'swiper/css/pagination';
import { Dispatch, FC, SetStateAction } from 'react';
import { experiences } from '~/content';
const ExperienceCarousel: FC<{
  currentExp: number;
  setCurrentExp: Dispatch<SetStateAction<number>>;
}> = ({ currentExp, setCurrentExp }) => {
  return (
    <>
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        initialSlide={currentExp}
        onActiveIndexChange={(swiper) => setCurrentExp(swiper.activeIndex)}
        navigation={true}
        slidesPerView={'auto'}
        coverflowEffect={{
          rotate: 0,
          stretch: 50,
          depth: 200,
          modifier: 1.5,
          slideShadows: true,
        }}
        pagination={false}
        modules={[EffectCoverflow, Pagination, Navigation]}
        className="experience-swiper"
      >
        {experiences.map((experience) => (
          <SwiperSlide key={experience.company}>
            <h3>{experience.company}</h3>
            <h2>{experience.title}</h2>
            <div className="content">
              <div className="left">
                <span>{experience.date}</span>
                <span>{experience.contract_type}</span>
                <ul className="links">
                  <li>
                    <a href="linkedin">
                      <i>link</i>
                    </a>
                  </li>
                  <li>
                    <a href="website">
                      <i>globa</i>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="right">
                <div />
                <img
                  src={experience.company_logo}
                  alt={` adel mohamed tadjerouni experince ${experience.company}`}
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <Swiper
        effect={'cards'}
        grabCursor={true}
        initialSlide={currentExp}
        onActiveIndexChange={(swiper) => setCurrentExp(swiper.activeIndex)}
        pagination={false}
        navigation
        modules={[EffectCoverflow, EffectCards, Navigation]}
        className="experience-swiper card"
      >
        {experiences.map((experience) => (
          <SwiperSlide key={experience.company}>
            <h3>{experience.company}</h3>
            <h2>{experience.title}</h2>
            <div className="content">
              <div className="left">
                <span>{experience.date}</span>
                <span>{experience.contract_type}</span>
                <ul className="links">
                  <li>
                    <a href="linkedin">
                      <i>link</i>
                    </a>
                  </li>
                  <li>
                    <a href="website">
                      <i>globa</i>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="right">
                <div />
                <img
                  src={experience.company_logo}
                  alt={` adel mohamed tadjerouni experince ${experience.company}`}
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default ExperienceCarousel;
