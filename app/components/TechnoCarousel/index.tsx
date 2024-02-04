import './index.css';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import { Autoplay, FreeMode } from 'swiper/modules';
import React from 'react';

const TechnoCarousel: React.FC<{ skills: string[] }> = ({ skills }) => {
  return (
    <Swiper
      grabCursor={true}
      pagination={false}
      modules={[Autoplay, FreeMode]}
      autoplay={{ delay: 0 }}
      spaceBetween={20}
      speed={2500}
      loop
      slidesPerView={'auto'}
      className="tech-swiper"
    >
      {skills.map((skill) => (
        <SwiperSlide key={skill}>
          <img
            src={`/images/skills/${skill
              .toLowerCase()
              .split(' ')
              .join('-')}-color.svg`}
            alt="skill pic"
          />
          <span>{skill}</span>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default TechnoCarousel;
