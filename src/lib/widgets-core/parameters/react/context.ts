import { createContext } from 'react';
import { LinkedData } from '../resolver';

export interface ParametersContextValues {
  linkedData: LinkedData;
}

export const ParametersContext = createContext<ParametersContextValues>({
  linkedData: { repos: {}, users: {}, orgs: {}, collections: {} },
});
