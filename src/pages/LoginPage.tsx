import {FormEvent} from "react";
import endpoint from "../services/API/endpoints";
import {User} from "../services/types/types";

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
                <form aria-label="sample form" onSubmit={handleSubmit}>
                    <label htmlFor="email">Email
                        <input id="email" placeholder={"First Name"}/>
                    </label>
                    <label htmlFor="password">Password
                        <input
                            id={""}
                            placeholder={"Password"}
                            type="password"
                            required
                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}"
                            {...InvalidPasswordProps}
                        />
                    </label>


                    {/*<div className="buttonContainer">*/}
                    {/*<button*/}
                    {/*    type="submit"*/}
                    {/*    className="some-class"*/}
                    {/*    style={{borderRadius: "5px"}}*/}
                    {/*>*/}
                    {/*    S'inscrire*/}
                    {/*</button>*/}
                    <button
                        type="submit"
                        className="some-class"
                        style={{borderRadius: "5px"}}
                    >
                        Connexion
                    </button>
                    {/*</div>*/}
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
