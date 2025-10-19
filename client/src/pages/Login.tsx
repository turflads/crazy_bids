import { useLocation } from "wouter";
import LoginPage from "@/components/LoginPage";

export default function Login() {
  const [, setLocation] = useLocation();

  const handleLogin = (username: string, password: string) => {
    // ============================================================================
    // USER CREDENTIALS - MODIFY THIS SECTION TO CHANGE USERNAME/PASSWORD
    // ============================================================================
    // To add a new user or change credentials, edit the credentials object below.
    // Format: username: { password: "your_password", role: "admin" | "owner" | "viewer" }
    // 
    // Example to change admin password:
    //   admin: { password: "newSecurePassword123", role: "admin" }
    //
    // Example to add a new owner:
    //   john: { password: "john123", role: "owner" }
    // ============================================================================
    const credentials: Record<string, { password: string; role: string }> = {
      admin: { password: "admin123", role: "admin" },
      owner: { password: "owner123", role: "owner" },
      viewer: { password: "viewer123", role: "viewer" },
    };

    const user = credentials[username];
    if (user && user.password === password) {
      localStorage.setItem("user", JSON.stringify({ username, role: user.role }));
      setLocation(`/${user.role}`);
    } else {
      alert("Invalid credentials");
    }
  };

  return <LoginPage onLogin={handleLogin} />;
}
