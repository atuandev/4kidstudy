/**
 * Topic interface representing a learning topic
 */
export interface Topic {
  id: string;
  title: string;
  description?: string;
  grade?: string;
  createdAt?: string;
  updatedAt?: string;
  coverImage?: string;
}
