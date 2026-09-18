import React from 'react';
import { ParsedResume } from '@/types';
import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { TechnicalTemplate } from './TechnicalTemplate';
import { DataAnalystTemplate } from './DataAnalystTemplate';
import { ProfessionalTemplate } from './ProfessionalTemplate';

interface ResumeRendererProps {
  resume: ParsedResume;
  templateId: string;
}

export const ResumeRenderer: React.FC<ResumeRendererProps> = ({ resume, templateId }) => {
  switch (templateId.toLowerCase()) {
    case 'modern':
      return <ModernTemplate resume={resume} />;
    case 'minimal':
      return <MinimalTemplate resume={resume} />;
    case 'technical':
      return <TechnicalTemplate resume={resume} />;
    case 'dataanalyst':
    case 'data analyst':
    case 'data-analyst':
      return <DataAnalystTemplate resume={resume} />;
    case 'professional':
      return <ProfessionalTemplate resume={resume} />;
    case 'classic':
    default:
      return <ClassicTemplate resume={resume} />;
  }
};
