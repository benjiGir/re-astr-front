import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const navbarClass = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: vars.color.shade3,
  fontSize: vars.fontSize.xl,
  height: vars.space.xxl,
  paddingLeft: vars.space.m,
  paddingRight: vars.space.m,
});

export const navbarIconClass = style({
  width: vars.space.xl,
  height: vars.space.xl,
});
