import React from 'react';
import { ParsedResume } from '@/types';
import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { TechnicalTemplate } from './TechnicalTemplate';
import { DataAnalystTemplate } from './DataAnalystTemplate';
import { ProfessionalTemplate } from './ProfessionalTemplate';
import { AcademicTemplate } from './AcademicTemplate';
import { HealthcareTemplate } from './HealthcareTemplate';
import { CreativeTemplate } from './CreativeTemplate';
import { FresherTemplate } from './FresherTemplate';

interface ResumeRendererProps {
  resume: ParsedResume;
  templateId: string;
}

export const ResumeRenderer: React.FC<ResumeRendererProps> = ({ resume, templateId }) => {
  const id = templateId.toLowerCase().replace(/[\s-_]/g, '');

  switch (id) {
    case 'modern':
      return <ModernTemplate resume={resume} />;
    case 'minimal':
      return <MinimalTemplate resume={resume} />;
    case 'technical':
    case 'engineering':
      return <TechnicalTemplate resume={resume} />;
    case 'dataanalyst':
    case 'analytics':
      return <DataAnalystTemplate resume={resume} />;
    case 'professional':
    case 'corporate':
    case 'executive':
    case 'management':
    case 'salesmarketing':
    case 'operations':
    case 'compact':
      return <ProfessionalTemplate resume={resume} />;
    case 'academic':
      return <AcademicTemplate resume={resume} />;
    case 'healthcare':
    case 'medical':
      return <HealthcareTemplate resume={resume} />;
    case 'creative':
      return <CreativeTemplate resume={resume} />;
    case 'fresher':
    case 'graduate':
      return <FresherTemplate resume={resume} />;
    case 'classic':
    default:
      return <ClassicTemplate resume={resume} />;
  }
};
