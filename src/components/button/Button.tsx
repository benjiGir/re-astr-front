import { ReactNode } from 'react';
import { RecipeVariantProps, cva } from 'styled-system/css';

const button = cva({
  base: {
    display: 'flex',
    paddingX: '128px',
    paddingY: '40px',
    border: 'none',
    borderRadius: '10px',
    fontSize: 'fontSizes.m',
    color: 'colors.shade1',
  },
  variants: {
    background: {
      primary: {
        backgroundColor: 'colors.shade4',
      },
      secondary: {
        backgroundColor: 'colors.shade2',
      },
    },
  },
});

type ButtonVariants = RecipeVariantProps<typeof button>;

type ButtonProps = ButtonVariants & {
  children: ReactNode;
  disabled?: boolean;
  type: 'button' | 'submit' | 'reset' | undefined;
};

export const Button = ({ children, disabled, type }: ButtonProps) => {
  return (
    <button type={type} className={button()} disabled={disabled}>
      {children}
    </button>
  );
};
