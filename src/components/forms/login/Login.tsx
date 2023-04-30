import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { inputFormClass, loginContainerClass, loginFormClass } from './login.css';
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
      <p>{t('home.login.title')}</p>
      <form className={loginFormClass} onSubmit={handleSubmit(onSubmit)}>
        <input className={inputFormClass} {...register('username')} disabled={isSubmitting} />
        {errors.username && <span>This field is required</span>}
        <input {...register('password')} disabled={isSubmitting} />
        <button type="submit" disabled={!isSubmitted}></button>
      </form>
    </div>
  );
}

export default Login;
