import { useForm, SubmitHandler } from "react-hook-form";

type TLoginInput = {
  username: string;
  password: string;
}

function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitted } } = useForm<TLoginInput>();

  const onSubmit: SubmitHandler<TLoginInput> = (data) => {
    console.log(data);
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("username")} />
        {errors.username && <span>This field is required</span>}
        <input {...register("password")} />
        <input type="submit" disabled={!isSubmitted} />
    </form>
  )
}

export default Login
