import { generateUtilityClasses } from '@mui/material';

export type RippleDotColor = 'info' | 'success' | 'error' | 'warning';
export type RippleDotClassKey = RippleDotColor | 'root' | 'active';
const slots: RippleDotClassKey[] = ['root', 'info', 'success', 'error', 'warning', 'active'];

const rippleDotClasses = generateUtilityClasses<RippleDotClassKey>('RippleDot', slots);

export default rippleDotClasses;
