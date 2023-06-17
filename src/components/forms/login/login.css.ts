import { vars } from '@/styles/theme.css';
import { style } from '@vanilla-extract/css';

export const loginContainerClass = style({
  display: 'flex',
  flexDirection: 'column',
  height: '50vh',
  width: '40vw',
  justifyContent: 'center',
  alignItems: 'center',
  paddingLeft: vars.space.l,
  paddingRight: vars.space.l,
  backgroundColor: vars.color.shade1,
  borderRadius : '20px',
  boxShadow : '8px 8px 15px 5px rgba(0, 0, 0, 0.15)',
});

export const loginFormClass = style({
  display: 'flex',
  flex: 2,
  flexDirection: 'column',
  justifyContent: 'space-evenly',
});

export const titleFormClass = style({
  width: '400px',
  height: '32px',
  marginBottom : vars.space.l, 
  marginTop:vars.space.l,
  color : vars.color.shade5,
  fontSize : vars.fontSize.xxxl,
  textAlign:'center',
});

export const inputFormClass = style({
  width: '400px',
  height: '32px',
  borderRadius : '10px',
  border : 'grey',
  boxShadow : '4px 3px 12px rgba(0, 0, 0, 0.15)',
});
export const buttonFormClass = style({
  width: '400px',
  height : '40px',
  display:'flex',
  flexDirection:'row',
  justifyContent:'space-between',
});

export const buttonLogFormClass = style({
  width: '128px',
  height : '40px',
  borderRadius : '10px',
  backgroundColor : vars.color.shade4,
  color : vars.color.shade1,
  fontSize : vars.fontSize.m,
});

export const buttonSignFormClass = style({
  width: '128px',
  height : '40px',
  borderRadius : '10px',
  backgroundColor : vars.color.shade2,
  border : 'none',
  color : vars.color.shade1,
  fontSize : vars.fontSize.m,
});

export const forgPassFormClass = style({
  width: '128px',
  height : '16px',
  margin :'0',
  color : vars.color.shade5,
  fontSize : vars.fontSize.xs,
  border:'none',
  padding :'0',
  textAlign:'left',
});

