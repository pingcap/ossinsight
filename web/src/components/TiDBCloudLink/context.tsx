import { createContext } from 'react';

export interface TiDBCloudLinkContextValues {
  campaign?: string;
  content?: string;
  trial?: boolean;
}

const TiDBCloudLinkContext = createContext<TiDBCloudLinkContextValues>({});

export default TiDBCloudLinkContext;
