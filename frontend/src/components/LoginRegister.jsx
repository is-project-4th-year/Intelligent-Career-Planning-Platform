import { useState } from "react";
import api from "../api/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Label } from "./ui/label";

export function LoginRegister({ mode, onSuccess, onToggleMode, onBack }) {
 const [email, setEmail] = useState("");
 const [name, setName] = useState("");
 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setError("");
 setLoading(true);

 try {
 if (mode === "register") {
 if (password !== confirmPassword) {
 setError("Passwords do not match");
 setLoading(false);
 return;
 }

      // Split name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const res = await api.post("register/", {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });

 if (res.status === 201) {
 alert("Registration successful! Please verify your email before logging in.");
 onToggleMode();
 }
 } else {
    const res = await api.post("login/", {
 email,
 password,
 });

 if (res.data.access) {
  localStorage.setItem("access_token", res.data.access);
  localStorage.setItem("refresh_token", res.data.refresh);
  localStorage.setItem("user", JSON.stringify(res.data.user || {}));

  const userData = res.data.user || {};
  onSuccess(userData);

  // 👇 Redirect based on whether the user has filled assessment
  if (!userData.has_assessment) {
    alert("Please complete your career assessment first.");
  }
}

 }
 } catch (err) {
 console.error(err);
 const msg =
 err.response?.data?.detail ||
 err.response?.data?.error ||
 "Something went wrong. Try again.";
 setError(msg);
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-accent/20 to-background px-4">
 <Card className="w-full max-w-md shadow-lg">
 <CardHeader>
 <CardTitle className="text-center text-2xl font-semibold">
 {mode === "login" ? "Login to Kazini" : "Create your Kazini Account"}
 </CardTitle>
 </CardHeader>
 <CardContent>
 <form onSubmit={handleSubmit} className="space-y-4">
 {mode === "register" && (
 <div>
 <Label htmlFor="name">Full Name</Label>
 <Input
 id="name"
 type="text"
 value={name}
 onChange={(e) => setName(e.target.value)}
 required
 />
 </div>
 )}

 <div>
 <Label htmlFor="email">Email</Label>
 <Input
 id="email"
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 />
 </div>

 <div>
 <Label htmlFor="password">Password</Label>
 <Input
 id="password"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 />
 </div>

 {mode === "register" && (
 <div>
 <Label htmlFor="confirmPassword">Confirm Password</Label>
 <Input
 id="confirmPassword"
 type="password"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 required
 />
 </div>
 )}

 {error && <p className="text-red-500 text-sm">{error}</p>}

 <Button type="submit" disabled={loading} className="w-full">
 {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
 </Button>

 <div className="text-center text-sm text-muted-foreground mt-2">
 {mode === "login" ? (
 <>
 Don’t have an account?{" "}
 <button
 type="button"
 onClick={onToggleMode}
 className="text-primary hover:underline"
 >
 Register
 </button>
 </>
 ) : (
 <>
 Already have an account?{" "}
 <button
 type="button"
 onClick={onToggleMode}
 className="text-primary hover:underline"
 >
 Login
 </button>
 </>
 )}
 </div>

 <button
 type="button"
 onClick={onBack}
 className="text-xs text-muted-foreground hover:underline block mx-auto mt-4"
 >
 ← Back to Home
 </button>
 </form>
 </CardContent>
 </Card>
 </div>
 );
}
