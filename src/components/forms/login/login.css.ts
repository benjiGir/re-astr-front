import { vars } from '@/styles/theme.css';
import { style } from '@vanilla-extract/css';

export const loginContainerClass = style({
  display: 'flex',
  flexDirection: 'column',
  height: '40vh',
  width: '40vw',
  justifyContent: 'center',
  alignItems: 'center',
  paddingLeft: vars.space.l,
  paddingRight: vars.space.l,
});

export const loginFormClass = style({
  display: 'flex',
  flex: 2,
  flexDirection: 'column',
  justifyContent: 'space-evenly',
});

export const inputFormClass = style({
  width: '256px',
});
