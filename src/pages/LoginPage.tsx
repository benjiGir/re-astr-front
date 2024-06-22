import { FormGroup, TextInput } from "@carbon/react";

const LoginPage = () => {
  return (
    <>
      <FormGroup
        legendId="formgroup-legend-id"
        legendText="FormGroup Legend"
        style={{ maxWidth: "400px" }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <TextInput id="email" labelText="First Name" />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <TextInput id="password" labelText="Last Name" />
        </div>
      </FormGroup>
    </>
  );
};

export default LoginPage;
