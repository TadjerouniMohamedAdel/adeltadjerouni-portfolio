import './index.css';
import React from 'react';

const TechnoCarousel: React.FC<{ skills: string[] }> = ({ skills }) => {
  return (
    <div className="tech-swiper">
      {skills.map((skill) => (
        <div className="swiper-slide" key={skill}>
          <img
            src={`/images/skills/${skill
              .toLowerCase()
              .split(' ')
              .join('-')}-color.svg`}
            alt="skill pic"
          />
          <span>{skill}</span>
        </div>
      ))}
    </div>
  );
};

export default TechnoCarousel;
