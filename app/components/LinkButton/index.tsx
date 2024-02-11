import React from 'react';
import './index.css';
import { Link } from '@remix-run/react';
type LinkButtonPropsType = {
  label: string;
  to: string;
  color?: 'purple' | 'transparent' | 'gold';
  leftIcon?: string;
  download?: boolean;
  rightIcon?: string;
  width?: 'small' | 'medium' | 'large';
};

const LinkButton: React.FC<LinkButtonPropsType> = ({
  label,
  to,
  leftIcon,
  rightIcon,
  color = 'purple',
  width = 'medium',
  download = false,
}) => {
  if (to.includes('https')) {
    return (
      <a
        href={to}
        className={`link-button ${width} ${color}`}
        download={download}
      >
        {leftIcon && <i className={`bx ${leftIcon}`} />}
        <span>{label}</span>
        {rightIcon && <i className={`bx ${rightIcon}`} />}
      </a>
    );
  }
  return (
    <Link
      to={to}
      className={`link-button ${width} ${color}`}
      aria-description="adel mohamed tadjerouni link"
    >
      {leftIcon && <i className={`bx ${leftIcon}`} />}
      <span>{label}</span>
      {rightIcon && <i className={`bx ${rightIcon}`} />}
    </Link>
  );
};

export default LinkButton;
