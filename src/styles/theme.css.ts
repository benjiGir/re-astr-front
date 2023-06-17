import { createGlobalTheme, globalStyle } from '@vanilla-extract/css';

const baseColors = {
  white: '#FFFFFF',
  black: '#000000',
  error: '#E57373',
  success: '#81C784',
};

const themeColors = {
  primary: '#F1F1F1',
  secondary: '#CFD2D7',
  tertiary: '#AAB5BD',
  quaternary: '#839AA0',
  quinary: '#5F807F',
  senary: '#43655A',
};

 const shadesColors = {
  shade1: '#F1F1F1',
  shade2: '#BCBCBC',
  shade3: '#898989',
  shade4: '#5A5A5A',
  shade5: '#2E2E2E',
};

export const vars = createGlobalTheme(':root', {
  color: {
    ...baseColors,
    ...themeColors,
    ...shadesColors,
  },
  font: {
    body: 'Montserrat, sans-serif',
  },
  fontSize: {
    xs: '12px',
    s: '14px',
    m: '16px',
    l: '18px',
    xl: '20px',
    xxl: '24px',
    xxxl: '64px'
  },
  space: {
    xs: '4px',
    s: '8px',
    m: '16px',
    l: '32px',
    xl: '48px',
    xxl: '64px',
  },
});

globalStyle('body', {
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
  fontFamily: vars.font.body,
});
