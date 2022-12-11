export interface Post {
  id: number;
  comment: string;
}
export interface Topic {
  id: number;
  title: string;
}

export interface TopicResource {
  topic?: Topic;
  posts?: Post[];
  isSuccess: boolean;
  tokenStr?: string;
  errorMessage?: string;
}

type Topics = Topic[];

export interface TopicsResource {
  topics: Topics;
  tokenStr: string;
  errorMessage: string;
}
