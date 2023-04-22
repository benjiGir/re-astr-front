import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

function Login() {
  const validationLoginSchema = z.object({
    username: z.string().nonempty(),
    password: z.string().nonempty(),
  })
  
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} disabled={isSubmitting} />
      {errors.username && <span>This field is required</span>}
      <input {...register('password')} disabled={isSubmitting}/>
      <input type="submit" disabled={!isSubmitted} />
    </form>
  );
}

export default Login;
