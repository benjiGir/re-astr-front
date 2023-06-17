import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  titleFormClass,
  inputFormClass,
  loginContainerClass,
  loginFormClass,
  buttonFormClass,
  buttonLogFormClass,
  buttonSignFormClass,
  forgPassFormClass,
} from './login.css';
import { useTranslation } from 'react-i18next';

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
    <div className={loginContainerClass}>
      <p className={titleFormClass}>{t('home.login.title')}</p>
      <form className={loginFormClass} onSubmit={handleSubmit(onSubmit)}>
        <input className={inputFormClass} {...register('username')} disabled={isSubmitting} />
        {errors.username && <span>This field is required</span>}
        <input className={inputFormClass} {...register('password')} disabled={isSubmitting} />
        <button type="button" className={forgPassFormClass}>
          Forgot Password ?
        </button>
        <div className={buttonFormClass}>
          <button type="submit" className={buttonSignFormClass} disabled={!isSubmitted}>
            Sign up
          </button>
          <button type="submit" className={buttonLogFormClass} disabled={!isSubmitted}>
            Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
