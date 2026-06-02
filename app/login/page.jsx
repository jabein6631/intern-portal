"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Rocket } from "lucide-react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./login.css";

function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    let e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid Email Address";
    if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const role = (data.user.role || "intern").toLowerCase()
        // Store with role-specific key so portals don't overwrite each other
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))         // shared fallback
        localStorage.setItem(`user_${role}`, JSON.stringify(data.user)) // role-specific key
        if (role === "mentor" || role === "evaluator") router.push("/mentor/dashboard")
        else if (role === "admin") router.push("/admin/dashboard")
        else if (role === "institution") router.push("/institution/dashboard")
        else router.push("/intern/dashboard")
      } else {
        // ❌ Show exact error from backend (wrong email/password)
        setServerError(data.error || "Invalid email or password");
      }
    } catch {
      // Backend not running — show clear message
      setServerError("Cannot connect to server. Make sure the backend is running on port 5000.");
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="logo-section">
            <i className="fa-solid fa-graduation-cap"></i>
            <h2>InternPortal</h2>
            <p>Your Internship Journey Simplified</p>
          </div>
          <div className="welcome-text">
            <h1>Welcome Back</h1>
            <p>Continue your internship journey</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <i className="fa-regular fa-envelope"></i>
              <input type="email" placeholder="Email Address" value={email}
                onChange={e => setEmail(e.target.value)}
                className={errors.email ? "error-input" : ""} />
            </div>
            {errors.email && <p className="error-text">{errors.email}</p>}

            <div className="input-group">
              <i className="fa-solid fa-lock"></i>
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)}
                className={errors.password ? "error-input" : ""} />
              <i className={`password-toggle fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                onClick={() => setShowPassword(!showPassword)} />
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}

            {/* Server error — wrong email/password */}
            {serverError && (
              <p className="error-text" style={{ textAlign:"center", marginBottom:"10px", fontSize:"13px" }}>
                <AlertTriangle size={14} style={{ verticalAlign:"middle", marginRight:4 }}/> {serverError}
              </p>
            )}

            <button type="submit" className="login-btn" disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Signing in…" : "Continue"}
            </button>

            <div className="divider"><span>or continue with</span></div>
            <div className="social-icons">
              <div className="social-btn"><i className="fa-brands fa-google"></i></div>
              <div className="social-btn"><i className="fa-brands fa-github"></i></div>
              <div className="social-btn"><i className="fa-brands fa-linkedin-in"></i></div>
            </div>
            <p className="signup-link">
              Don't have an account? <Link href="/signup">Sign Up</Link>
            </p>
          </form>
        </div>
        <div className="info-side">
          <div className="info-content">
            <h2 style={{ display:"flex", alignItems:"center", gap:"8px" }}><Rocket size={22}/> Track Your Progress</h2>
            <p>Log in to access your personal dashboard, review application statuses, and chat directly with your project mentors.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
