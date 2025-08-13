interface Conversion {
  // Conversion Identification
  conversionMonth: string;
  studentId: string;
  fullName: string;

  // Student Academic Data
  university: string;
  course: string;
  targetAudience: string;
  targetStatus: string;
  graduationYear: number;

  // Conversion Registration
  registrationSource: string;
  registrationDate: Date;

  // Opportunity Details
  opportunityType: string; // internship, job, trainee, etc.
  position: string;
  details?: string;
  sectorArea: string;
  career: string;
  track: string;

  // Organization Information
  organizationName: string;
  organizationWebsite?: string;
  partnerCompany: boolean;
  topGlobalCompanies: boolean;

  // Period and Compensation
  opportunityStart: Date;
  opportunityEnd?: Date;
  compensation?: number;
  compensationSource?: string;

  // Ismart Tracking
  ismartReferral: boolean;
  opportunityStatus: string;
  comments?: string;
  tag?: string;
  featured: boolean;

  // Prioritization and Validation
  statusPriority: number;
  opportunityTypePriority: number;
  generalPriority: number;
  automaticVerificationFormula?: string;
  automaticVerification: boolean;
  timeValidation: boolean;
}
