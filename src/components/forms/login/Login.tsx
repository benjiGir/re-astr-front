import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { stack } from 'styled-system/patterns';
import { css } from 'styled-system/css';
import { Button } from '@/components/button/Button';

function Login() {
  const { t } = useTranslation();
  const validationLoginSchema = z.object({
    username: z.string().nonempty(),
    password: z.string().nonempty(),
  });

  type TValidationLoginSchema = z.infer<typeof validationLoginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted, isSubmitting },
  } = useForm<TValidationLoginSchema>({
    resolver: zodResolver(validationLoginSchema),
  });

  const onSubmit: SubmitHandler<TValidationLoginSchema> = (data) => {
    console.log(data);
  };

  return (
    <div
      className={stack({
        height: '50vh',
        width: '30vw',
        justifyContent: 'center',
        alignItems: 'center',
        paddingX: 'l',
        backgroundColor: 'shade1',
        borderRadius: '20px',
        boxShadow: '8px 8px 15px 5px rgba(0, 0, 0, 0.15)',
      })}
    >
      <p
        className={css({
          width: '400px',
          height: '32px',
          marginY: 'l',
          color: 'shade5',
          fontSize: 'xxxl',
          textAlign: 'center',
        })}
      >
        {t('home.login.title')}
      </p>
      <form
        className={stack({
          flex: 2,
          justifyContent: 'space-evenly',
        })}
        onSubmit={handleSubmit(onSubmit)}
      >
        <input {...register('username')} disabled={isSubmitting} />
        {errors.username && <span>This field is required</span>}
        <input {...register('password')} disabled={isSubmitting} />
        <button type="button">Forgot Password ?</button>
        <div
          className={stack({
            direction: 'row',
            justifyContent: 'space-between',
            width: '100%',
            paddingX: 's',
            paddingY: 'm',
          })}
        >
          <Button type="submit" disabled={!isSubmitted}>
            Sign up
          </Button>
          <Button type="submit" disabled={!isSubmitted} background="secondary">
            Login
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Login;
