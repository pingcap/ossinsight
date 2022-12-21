import axios, { AxiosInstance } from 'axios';

export interface SendEmailPayload {
  to: string;
  subject: string;
  templateName: EmailTemplateNames;
  templateData: Record<string, any>;
}

export enum EmailTemplateNames {
  REPO_FEEDS = 'repo-feeds',
}

export class EmailClient {
  private readonly httpClient: AxiosInstance;

  constructor (readonly baseURL: string) {
    this.httpClient = axios.create({
      baseURL: baseURL,
      timeout: 3000,
    });
  }

  async sendEmail (payload: SendEmailPayload): Promise<void> {
    return this.httpClient.post('/email', payload);
  }
}
