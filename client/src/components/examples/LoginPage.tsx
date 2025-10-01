import LoginPage from '../LoginPage';

export default function LoginPageExample() {
  return (
    <LoginPage 
      onLogin={(username, password) => {
        console.log('Login attempted:', username, password);
      }}
    />
  );
}
