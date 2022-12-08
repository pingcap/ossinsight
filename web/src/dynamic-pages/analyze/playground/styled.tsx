import { ButtonBase, styled } from '@mui/material';

export const PlaygroundContainer = styled('section', { name: 'PlaygroundContainer' })`
  height: 80vh;
  overflow: hidden;
  width: 100%;
  padding: 0;
`;

export const PlaygroundHeadline = styled('h2', { name: 'PlaygroundHeadline' })`
  font-size: 24px;
  background: linear-gradient(90deg, #FF6B00 0%, #E6A078 49.53%, #FFE895 109.31%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  .opaque {
    -webkit-text-fill-color: transparent;
    text-fill-color: initial;
  }
`;

export const PlaygroundDescription = styled('ol', { name: 'PlaygroundDescription' })`
  font-size: 12px;
  color: #7C7C7C;
  line-height: 18px;
  list-style-position: inside;
  padding: 0;
`;

export const PlaygroundBody = styled('div', { name: 'PlaygroundBody' })`
  display: flex;
  margin-bottom: 1rem;
  height: 100%;
`;

export const PlaygroundSide = styled('aside', { name: 'PlaygroundSide' })`
  height: 100%;
  overflow-y: auto;
  width: 40%;
  max-width: 40vw;
  background: #000;
  border: 1px solid #565656;
  padding: 16px;
`;

export const PlaygroundMain = styled('main', { name: 'PlaygroundMain' })`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  padding: 16px;
  box-sizing: border-box;
  position: relative;
`;

export const PlaygroundButton = styled(ButtonBase, { name: 'PlaygroundButton' })`
  position: fixed;
  z-index: 1300;
  right: 32px;
  bottom: 32px;
  transition: transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;
  &.opened {
    transform: translateY(-80vh);
  }
`;

export const EditorContainer = styled('div', { name: 'EditorContainer' })`
  position: relative;
  max-height: min(50%, 350px);
  min-height: min(50%, 350px);
  border: 1px solid #565656;
  & .ace_editor .ace_comment.ace_placeholder {
    font-style: normal;
    transform: none;
    opacity: 1;
  }
`;

export const EditorExtra = styled('div', { name: 'EditorExtra' })`
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
  gap: 8px;
`;

export const ResultBlockContainer = styled('div', { name: 'ResultBlockContainer' })`
  flex: 1;
  overflow-y: scroll;
  background: #141414;
  border: 1px solid #565656;
  padding: 12px;
  box-sizing: border-box;
`;

export const ResultBlockEmptyContainer = styled(ResultBlockContainer)`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  font-family: monospace;
`;

export const ResultBlockErrorContainer = styled(ResultBlockEmptyContainer)`
  border: none;
  padding: 0;
  > * {
    width: 100%;
    height: 100%;
  }
`;

export const Gap = styled('div', { name: 'Gap' })`
  min-height: 16px;
  max-height: 16px;
`;
