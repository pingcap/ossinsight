import { ButtonBase, Paper, styled } from '@mui/material';
import ArrowIcon from './arrow.svg';

export const PlaygroundContainer = styled('section', { name: 'PlaygroundContainer' })`
  height: 90vh;
  overflow: hidden;
  width: 100%;
  padding: 0;
`;

export const PlaygroundHeadline = styled('div', { name: 'PlaygroundHeadline' })`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
`;

export const PlaygroundTitle = styled('h2', { name: 'PlaygroundTitle' })`
  font-size: 24px;
  display: flex;
  align-items: center;
  margin: 0;
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

export const PlaygroundHeadlineExtra = styled('div', { name: 'PlaygroundHeadlineExtra' })`
  &:before {
    content: ' ';
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 6px;
    background-color: #FF8300;
    margin-right: 6px;
    vertical-align: middle;
  }
  font-size: 16px;
  font-weight: bold;
`;

export const Beta = styled('span', { name: 'Beta Tag' })`
  display: inline-block;
  -webkit-text-fill-color: transparent;
  text-fill-color: initial;
  padding: 2px 8px;
  border: 1px solid #FF6B00;
  color: #FF6B00;
  border-radius: 12px;
  margin-left: 8px;
  font-weight: normal;
  font-size: 14px;
`;

export const PlaygroundDescription = styled('div', { name: 'PlaygroundDescription' })`
  font-size: 14px;
  padding: 0;
  margin-top: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;

  > p:last-of-type {
    margin-bottom: 0;
  }
`;

export const BaseInputContainer = styled('div', { name: 'BaseInputContainer' })`
  max-height: min(60%, 450px);
  min-height: min(60%, 450px);
  position: relative;
  border: 1px solid #565656;
`;

export const BaseInputBottomLine = styled('div', { name: 'BaseInputBottomLine' })`
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
`;

export const PlaygroundBody = styled('div', { name: 'PlaygroundBody' })`
  display: flex;
  margin-bottom: 1rem;
  height: 100%;
  max-height: calc(100% - 60px);
`;

export const PlaygroundSide = styled('aside', { name: 'PlaygroundSide' })`
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 40vw;
  min-width: 500px;
  padding: 0 16px 16px;
`;

export const QuestionFieldTitle = styled('div', { name: 'QuestionFieldTitle' })`
  display: inline-flex;
  align-items: center;
`;

export const PlaygroundTips = styled('div', { name: 'PlaygroundTips' })`
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const PlaygroundTipsText = styled('div', { name: 'PlaygroundTips-Text' })`
  font-size: 16px;
  font-weight: bold;
  height: 32px;
  line-height: 32px;
`;

export const PlaygroundMain = styled('main', { name: 'PlaygroundMain' })`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  padding: 0 16px 16px;
  box-sizing: border-box;
  position: relative;
`;

export const PlaygroundButtonContainer = styled('div', { name: 'PlaygroundButtonContainer' })`
  position: fixed;
  display: none;
  z-index: 1300;
  right: 32px;
  bottom: 32px;
  flex-direction: column;
  align-items: end;

  ${({ theme }) => theme.breakpoints.up('md')} {
    display: flex;
  }

  transition: transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;

  &.opened {
    transform: translateY(-90vh);
  }
`;

export const PlaygroundButton = styled(ButtonBase, { name: 'PlaygroundButton' })`
  display: block;
`;

export const EditorContainer = styled(BaseInputContainer, { name: 'EditorContainer' })`
  & .ace_editor .ace_comment.ace_placeholder {
    font-style: normal;
    transform: none;
    opacity: 1;
  }
`;

export const EditorExtra = styled(BaseInputBottomLine, { name: 'EditorExtra' })`
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

export const PlaygroundPopoverContent = styled(Paper, { name: 'PlaygroundPopoverContent' })`
  width: 340px;
  padding: 24px 12px;
  border-radius: 16px;

  > h2 {
    font-size: 16px;
    font-weight: bold;
  }

  > p {
    font-size: 12px;
    color: #565656;
  }
`;

export const Logo = styled('img', { name: 'Logo' })`
  vertical-align: text-bottom;
`;

export const StyledArrowIcon = styled(ArrowIcon)`
  position: absolute;
  right: -26px;
  top: 80px;
  z-index: 10;
  box-shadow: ${({ theme }) => theme.shadows[4]};
  border-radius: 50%;
`;
