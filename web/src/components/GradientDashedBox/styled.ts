import { styled } from '@mui/material';

export interface CommonProps {
  borderRadius: number;
}

export interface GradientRootProps extends CommonProps {
  stops: Array<[color: string, percent: number]>;
  deg: number;
}

export interface InnerProps extends CommonProps {
  backgroundColor: string;
}

export const Root = styled('a', { name: 'GradientDashedBox', slot: 'root', shouldForwardProp: propName => !['stops', 'deg', 'borderRadius'].includes(propName as string) })<GradientRootProps>`
  display: block;
  background: linear-gradient(${({ deg }) => deg}deg, ${({ stops }) => stops.map(([color, percent]) => `${color} ${percent}%`).join(', ')});
  border-radius: ${({ borderRadius }) => borderRadius}px;

  &, &:active, &:hover {
    text-decoration: none;
    color: initial;
  }
`;

export const Container = styled('span', { name: 'GradientDashedBox', slot: 'container', shouldForwardProp: propName => !['backgroundColor', 'borderRadius'].includes(propName as string) })<InnerProps>`
  display: block;
  border-radius: ${({ borderRadius }) => borderRadius}px;
  border: dashed 1px ${({ backgroundColor }) => backgroundColor};
  box-sizing: border-box;
`;

export const Content = styled('span', { name: 'GradientDashedBox', slot: 'content', shouldForwardProp: propName => !['backgroundColor', 'borderRadius'].includes(propName as string) })<InnerProps>`
  display: block;
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: ${({ borderRadius }) => borderRadius - 1}px;
`;
