import { Project } from '~/content';
import React from 'react';
import { Link } from '@remix-run/react';
import './styles.css';

interface ProjectItemPropsType {
  project: Project;
}

const ProjectItem: React.FC<ProjectItemPropsType> = ({ project }) => {
  return (
    <Link to={`/projects/${project.id}`} className="project-card">
      <div className="project-card__head">
        <div className="project-card__logo">
          <img
            src={project.project_logo}
            alt={`Adel Mohamed Tadjerouni project ${project.name}`}
          />
        </div>
        <span className="project-card__type">{project.type}</span>
      </div>
      <h3 className="project-card__name">{project.name}</h3>
      <p className="project-card__desc">{project.short_description}</p>
      <div className="project-card__tags">
        {project.technologies.slice(0, 5).map((techno) => (
          <span key={techno} className="tag">
            {techno}
          </span>
        ))}
      </div>
      <span className="project-card__cta">
        Explore details
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h13" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
};

export default ProjectItem;
