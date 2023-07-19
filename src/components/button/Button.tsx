import { ReactNode } from 'react';
import { RecipeVariantProps, cva } from 'styled-system/css';

const button = cva({
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '128px',
    height: '40px',
    border: 'none',
    borderRadius: '10px',
    fontSize: 'md',
    color: 'shade1',
  },
  variants: {
    background: {
      primary: {
        backgroundColor: 'shade4',
      },
      secondary: {
        backgroundColor: 'shade2',
      },
    },
  },
  defaultVariants: {
    background: 'primary',
  },
});

type ButtonVariants = RecipeVariantProps<typeof button>;

type ButtonProps = ButtonVariants & {
  children: ReactNode;
  disabled?: boolean;
  type: 'button' | 'submit' | 'reset' | undefined;
};

export const Button = ({ children, disabled, type, background }: ButtonProps) => {
  return (
    <button type={type} className={button({ background })} disabled={disabled}>
      {children}
    </button>
  );
};
