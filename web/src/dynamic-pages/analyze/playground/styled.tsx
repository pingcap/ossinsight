import { styled } from '@mui/material';

export const PlaygroundContainer = styled('section', { name: 'PlaygroundContainer' })`
  height: 80vh;
  overflow: hidden;
  width: 100%;
  padding: 1rem;
  border-top: .5px solid grey;
`;

export const PlaygroundHeadline = styled('div', { name: 'PlaygroundHeadline' })`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 0 1rem 1rem 1rem;
`;

export const PlaygroundHeadlineExtra = styled('div', { name: 'PlaygroundHeadlineExtra' })`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
`;

export const PlaygroundBody = styled('div', { name: 'PlaygroundBody' })`
  display: flex;
  gap: 16px;
  margin-bottom: 1rem;
  height: 100%;
  max-height: calc(100% - 3.5rem);
`;

export const PlaygroundSide = styled('aside', { name: 'PlaygroundSide' })`
  height: 100%;
  overflow-y: auto;
  width: 40%;
  max-width: 40vw;
`;

export const PlaygroundMain = styled('main', { name: 'PlaygroundMain' })`
  height: 100%;
  overflow-y: auto;
  width: 100%;
  padding: 0 1rem;
`;
