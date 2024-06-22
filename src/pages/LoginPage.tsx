import { Button, Form, TextInput } from "@carbon/react";
import { FormEvent } from "react";
import endpoint from "../services/API/endpoints";
import { User } from "../services/types/types";

const LoginPage = () => {
  const  InvalidPasswordProps=["Your password must be at least 6 characters as well as contain at least one uppercase, one lowercase, and one number."]

  const handleSubmit=(e: FormEvent<HTMLFormElement> )=>{
   e.preventDefault()
  const formData = new FormData(e.currentTarget);
  
  fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint.auth.login}`, { method: "POST", body: formData })
  .then((res :Response)=>res.json())
  .then ((res : User)=>{console.log(res)})
  
  }

  return (
    <div className="loginContainer">
      <Form aria-label="sample form" onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem"}}>
          <TextInput id="email" labelText="First Name" />
        </div>
        <div style={{ marginBottom: "1rem" }}>
        <TextInput id={""} labelText={"Password"} type="password" required pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}" {...InvalidPasswordProps} />
        </div>
        <Button type="submit" className="some-class" >
          Submit
        </Button>
      </Form>
    </div>
  );
};

export default LoginPage;
