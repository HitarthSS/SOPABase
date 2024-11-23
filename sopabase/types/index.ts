// types/index.ts
export type Role = 'user' | 'assistant' | 'adversary' | 'judge';

export interface Message {
  role: Role;
  content: string;
  id: string;
}

export interface TypingIndicatorProps {
  role: Role;
}