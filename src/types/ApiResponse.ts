export  interface Messages {
  id?: string;
    createdAt: Date;
    content: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Array<Messages>;
}
