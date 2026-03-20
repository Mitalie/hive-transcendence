import { GitSignInButton } from "@/components/buttons/github-signin";

const Login = () => {
  return (
    <div className="bg-emerald-500 m-48">
      <h1>Login Page</h1>
      <p>Insert your username and password to login</p>
      <p>OR</p>
      <p>Login with following:</p>
      <GitSignInButton />
    </div>
  );
};

export default Login;
