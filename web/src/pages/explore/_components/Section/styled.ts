import { generateUtilityClasses, styled } from '@mui/material';

export const sectionClasses = generateUtilityClasses('Section', ['pending', 'loading', 'success', 'error']);

export const SectionRoot = styled('section', { name: 'Section', slot: 'root' })`
  background: linear-gradient(116.45deg, rgba(89, 95, 236, 0.5) 0%, rgba(200, 182, 252, 0.1) 96.73%);
  padding: 1px;
  border-radius: 6px;
  margin-top: 12px;

  transform: translateY(20px);
  opacity: 0;
  transition: all .5s ease;

  &:before {
    display: none;
  }

  &.${sectionClasses.success}, &.${sectionClasses.loading}, &.${sectionClasses.error} {
    transform: initial;
    opacity: 1;
  }

  &.pending {
    transform: translateY(20px);
    opacity: 0;
  }
`;

export const SectionContainer = styled('div', { name: 'Section', slot: 'container' })`
  border: none;
  background: rgb(36, 35, 43);
  border-radius: 5px !important;
  padding: 4px 8px;
`;

export const SectionHeader = styled('div', { name: 'Section', slot: 'header' })`
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
`;

export const SectionBody = styled('div', { name: 'Section', slot: 'body' })`
  padding: 0 16px;
`;
