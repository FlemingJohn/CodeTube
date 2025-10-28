

export type TranscriptEntry = {
  text: string;
  offset: number; // in milliseconds
  duration: number; // in milliseconds
};

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
  // This will be a string on the client, but might be an array during server processing.
  // The server now sends the full transcript string to each chapter.
  transcript: TranscriptEntry[] | string; 
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
