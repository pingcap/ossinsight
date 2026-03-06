import { styled } from '@mui/material';

export const SectionRoot = styled('section', { name: 'Section', slot: 'root' })`
  background: linear-gradient(116.45deg, rgba(89, 95, 236, 0.5) 0%, rgba(200, 182, 252, 0.1) 96.73%);
  padding: 1px;
  border-radius: 6px;
  margin-top: 12px;
`;

export const SectionContainer = styled('div', { name: 'Section', slot: 'container' })`
  border: none;
  background: rgb(36, 35, 43);
  border-radius: 5px !important;
  padding: 0 8px;
  overflow: hidden;
  position: relative;
`;

export const SectionHeader = styled('div', { name: 'Section', slot: 'header' })`
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
`;

export const SectionBody = styled('div', { name: 'Section', slot: 'body' })`
  padding: 0 16px;
`;
