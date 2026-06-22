export interface User {
  id: number;
  username: string;
}

export interface Exercise {
  id: number;
  description: string;
  duration: number;
  date: string;
}

export interface AddExerciseResponse {
  userId: number;
  exerciseId: number;
  duration: number;
  description: string;
  date: string;
}

export interface UserLogsResponse extends User {
  count: number;
  logs: Exercise[];
}
