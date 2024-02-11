import { Project } from '~/content';
import React from 'react';
import LinkButton from '../LinkButton';
import './styles.css';

interface ProjectItemPropsType {
  project: Project;
}
const ProjectItem: React.FC<ProjectItemPropsType> = ({ project }) => {
  return (
    <div className="project">
      <div className={`imgContainer ${project.name.toLocaleLowerCase()}`}>
        <img
          src={project.project_logo}
          alt={` adel mohamed tadjerouni project ${project.name}`}
        />
      </div>
      <ul>
        {project.technologies.slice(0, 5).map((techno) => (
          <li key={techno}>{techno}</li>
        ))}
      </ul>
      <h3>{project.type}</h3>

      <h4>
        {project.name} : {project.short_description}
      </h4>
      <div className="links">
        <LinkButton
          rightIcon="bxs-navigation"
          label="Read more"
          to={`/projects/${project.id}`}
          width="medium"
        />
        <LinkButton
          color="transparent"
          leftIcon="bxl-github"
          label="Source code"
          to="/projects/1"
          width="medium"
        />
      </div>
    </div>
  );
};

export default ProjectItem;
