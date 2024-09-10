import { css, styled, Unstable_Grid2 as Grid } from '@mui/material';

export const HeadingContainer = styled('div')`
  background-color: #212122;
  padding: 40px 12px;
  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      padding: 120px 0;
    `,
  })}
`;

export const Heading = styled(Grid)`
  max-width: 1280px;
  margin: 0 auto;
  display: none;

  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      display: flex;
    `,
  })}
`;

export const HeadingLeft = styled(Grid)`
  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      position: relative;

      &:after {
        display: block;
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        content: ' ';
        border-right: 1px solid white;
      }
    `,
  })}
`;

export const HeadingRight = styled(Grid)`
  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      display: flex;
      flex-direction: column;
      max-height: 100%;
    `,
  })}
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
      font-size: 54px;
      text-align: right;
    `,
  })}
`;

export const HeadingDescription = styled('p')`
  color: #7C7C7C;
  font-size: 16px;
  line-height: 24px;
  text-align: left;
  margin-bottom: 0;

  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      text-align: right;
    `,
  })}
`;

export const HeadingLogos = styled('div')`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  width: 100%;
  justify-content: center;

  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      justify-content: start;
    `,
  })}
`;

export const HeadingPrompt = styled('div')`
  font-size: 18px;
  line-height: 28px;
  margin-top: 24px;
  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      margin-top: 80px;
    `,
  })}
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
