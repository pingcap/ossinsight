import { css, styled } from '@mui/material';

export const HeadingContainer = styled('div')`
  background-color: #212122;
  padding: 40px 12px 60px;
  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      padding: 80px 0 120px;
    `,
  })}
`;

export const Heading = styled('div')`
  max-width: 1442px;
  margin: 0 auto;
`;

export const HeadingTitlePrefix = styled('span')`
  font-weight: 600;
  line-height: 1;
  color: white;
`;

export const HeadingTitle = styled('h1')`
  font-size: 36px;
  line-height: 1.25;
  font-weight: 900;
  text-align: center;
  color: #FFE895;
  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      font-size: 60px;
    `,
  })}
`;

export const HeadingDescription = styled('p')`
  color: #7C7C7C;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
  margin-bottom: 0;

  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      text-align: center;
    `,
  })}
`;

export const HeadingLogos = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 24px auto;
  width: 100%;
  color: #7C7C7C;
`;

export const HeadingPrompt = styled('div')`
  text-align: center;
  font-size: 18px;
  line-height: 28px;
  margin-top: 24px;
  color: #5DC1ED;
`;

export const HeadingSpacing = styled('span')`
  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      flex: 1;
    `,
  })}
`;

export const MobileHeading = styled('div')`
  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      display: none;
    `,
  })}
  h1 {
    font-size: 50px;
    line-height: 61.12px;
    font-weight: 900;
    color: #FDE494;

    span {
      color: white;
    }
  }

  p {
    color: #7C7C7C;
    font-size: 16px;
    line-height: 27px;
    font-weight: 400;
  }

  p.action-prompt {
    font-size: 20px;
    line-height: 35px;
    font-weight: 400;
    color: #FFFFFF;
  }
`;
