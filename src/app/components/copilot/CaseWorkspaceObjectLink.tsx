'use client';

import type { MouseEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import {
  openCaseWorkspaceObject,
  type OpenCaseWorkspaceObjectHandler,
  type OpenCaseWorkspaceObjectInput,
} from '../../utils/openCaseWorkspaceObject';

type CaseWorkspaceObjectLinkProps = {
  input: OpenCaseWorkspaceObjectInput;
  href: string;
  onOpen?: OpenCaseWorkspaceObjectHandler;
  className?: string;
  children: ReactNode;
};

export function CaseWorkspaceObjectLink({
  input,
  href,
  onOpen,
  className,
  children,
}: CaseWorkspaceObjectLinkProps) {
  const navigate = useNavigate();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (onOpen) {
      onOpen(input);
      return;
    }
    openCaseWorkspaceObject(navigate, input);
  };

  return (
    <a href={href} onClick={handleClick} data-keep-sidepanel className={className}>
      {children}
    </a>
  );
}
