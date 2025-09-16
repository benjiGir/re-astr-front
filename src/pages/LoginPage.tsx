import { Button, Form, TextInput } from "@carbon/react";
import { FormEvent } from "react";
import endpoint from "../services/API/endpoints";
import { User } from "../services/types/types";

const LoginPage = () => {
  const InvalidPasswordProps = [
    "Your password must be at least 6 characters as well as contain at least one uppercase, one lowercase, and one number.",
  ];

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint.auth.login}`, {
      method: "POST",
      body: formData,
    })
      .then((res: Response) => res.json())
      .then((res: User) => {
        console.log(res);
      });
  };

  return (
    <div className="loginContainer">
      <div className="loginForm">
        <h2>Bienvenue</h2>
        <Form aria-label="sample form" onSubmit={handleSubmit}>
          <div
            style={{ marginBottom: "1rem", width: "15vw", minWidth: "15rem" }}
          >
            <TextInput id="email" labelText="First Name" />
          </div>
          <div
            style={{ marginBottom: "1rem", width: "15vw", minWidth: "15rem" }}
          >
            <TextInput
              id={""}
              labelText={"Password"}
              type="password"
              required
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}"
              {...InvalidPasswordProps}
            />
          </div>
          <div className="buttonContainer">
            <Button
              type="submit"
              className="some-class"
              style={{ borderRadius: "5px" }}
            >
              S'inscrire
            </Button>
            <Button
              type="submit"
              className="some-class"
              style={{ borderRadius: "5px" }}
            >
              Connexion
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
