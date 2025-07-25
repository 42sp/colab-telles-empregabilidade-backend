interface Student {
  // Personal Data
  id: string;
  name: string;
  socialName?: string;
  preferredName?: string;
  ismartEmail: string;
  phoneNumber: string;
  gender: string;
  sexualOrientation?: string;
  raceEthnicity?: string;
  hasDisability?: boolean;
  linkedin?: string;

  // Academic Data
  transferredCourseOrUniversity?: boolean;
  transferDate?: Date;
  currentCourseStart: Date;
  currentCourseStartYear: number;
  currentCourseEnd: Date;
  currentCourseEndYear: number;
  supportedCourseFormula: string;
  currentArea: string;
  universityType: string;
  currentAggregatedCourse: string;
  currentDetailedCourse: string;
  currentDetailedUniversity: string;
  currentCity: string;
  currentState: string;
  currentCountry: string;
  currentAggregatedLocation: string;
  currentShift: string;

  // Status and Profile
  holderContractStatus: string;
  realStatus: string;
  realProfile: string;
  hrProfile: string;
  targetStatus: string;
  entryProgram: string;
  projectYears: number;
  entryYearClass: string;
  schoolNetwork: string;
  school: string;
  standardizedSchool: string;
  groupedLocation: string;
  specificLocation: string;
  duplicatedTargetStatus: string;
  duplicatedCurrentStatus: string;
  targetAudience: string;

  // Work and Opportunities
  working: boolean;
  opportunityType?: string;
  details?: string;
  sector?: string;
  careerTrack?: string;
  organization?: string;
  website?: string;
  startDate?: Date;
  endDate?: Date;
  compensation?: number;
  partnerCompanies?: boolean;
  topGlobalCompanies?: boolean;
  comments?: string;
  tag?: string;

  // Months (first series)
  jan?: string;
  feb?: string;
  mar?: string;
  apr?: string;
  may?: string;
  jun?: string;
  jul?: string;
  aug?: string;
  sep?: string;
  oct?: string;
  nov?: string;
  dec?: string;

  // Months (second series - full names)
  january?: string;
  february?: string;
  march?: string;
  april?: string;
  mayFull?: string;
  june?: string;
  july?: string;
  august?: string;
  september?: string;
  october?: string;
  november?: string;
  december?: string;

  // Months (third series)
  january2?: string;
  february2?: string;
  march2?: string;
  april2?: string;
  may2?: string;
  june2?: string;
  july2?: string;
  august2?: string;
  september2?: string;
  october2?: string;
  november2?: string;
  december2?: string;

  // Career Questionnaire
  internshipUnavailabilityReason?: string;
  careerTrajectoryInterests?: string[];
  primaryInterest?: string;
  secondaryInterest?: string;
  intendedWorkingAreas?: string[];
  additionalAreaInterests?: string;
  seekingProfessionalOpportunity?: boolean;
  opportunitiesLookingFor?: string[];
  opportunityDetails?: string;

  // Skills
  languages?: string[];
  technicalKnowledge?: string[];
  officePackageKnowledge?: boolean;
  wordProficiencyLevel?: string;
  excelProficiencyLevel?: string;
  powerPointProficiencyLevel?: string;
}
