import { defineTokens } from '@pandacss/dev';
import { colors } from './colors';

export const tokens = defineTokens({
  fontSizes: {
    xs: { value: '12px' },
    sm: { value: '14px' },
    md: { value: '16px' },
    lg: { value: '18px' },
    xl: { value: '20px' },
    xxl: { value: '24px' },
    xxxl: { value: '64px' },
  },
  spacing: {
    xs: { value: '4px' },
    sm: { value: '8px' },
    md: { value: '16px' },
    lg: { value: '32px' },
    xl: { value: '48px' },
    xxl: { value: '64px' },
  },
  colors,
});
