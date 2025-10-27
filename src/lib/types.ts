
export type Quiz = {
  question: string;
  options: string[];
  answer: string;
};

export type InterviewQuestion = {
  question: string;
  answer: string;
};

export type Chapter = {
  id: string;
  timestamp: string;
  title: string;
  summary: string;
  code: string;
  codeExplanation: string;
  // A placeholder for the actual transcript for AI summary generation
  transcript: string;
  quiz?: Quiz[];
  interviewQuestions?: InterviewQuestion[];
  thumbnail?: string;
};

export type Course = {
  id:string;
  userId: string;
  title: string;
  videoId: string | null;
  chapters: Chapter[];
  category?: CourseCategory;
  interviewQuestions?: InterviewQuestion[];
  createdAt: any;
  updatedAt: any;
};

export const COURSE_CATEGORIES = [
  'Programming',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'AI/ML',
  'DevOps',
  'Game Development',
  'General',
] as const;

export type CourseCategory = typeof COURSE_CATEGORIES[number];
