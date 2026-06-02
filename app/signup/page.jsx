"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import "./signup.css";

function Signup() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [formData, setFormData] = useState({ fullName:"", email:"", role:"", password:"", confirmPassword:"", terms:false });
  const [errors, setErrors] = useState({});

  // Back button — goes to previous page (settings or login)
  const handleBack = () => router.back();

  const validate = () => {
    let e = {};
    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    if (!formData.role) e.role = "Please select role";
    if (formData.password.length < 6) e.password = "Minimum 6 characters required";
    if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!formData.terms) e.terms = "Accept terms & conditions";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("https://intern-portal-backend-dw9j.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: formData.fullName, email: formData.email, password: formData.password, role: formData.role }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        const userObj = { ...data.user, isDemo: false }
        localStorage.setItem("user", JSON.stringify(userObj));
        setLoading(false);
        const role = (data.user.role || "intern").toLowerCase()
        if (role === "mentor" || role === "evaluator") router.push("/mentor/dashboard")
        else if (role === "admin") router.push("/admin/dashboard")
        else if (role === "institution") router.push("/institution/dashboard")
        else router.push("/intern/dashboard")
      } else {
        setServerError(data.error || "Registration failed");
        setLoading(false);
      }
    } catch {
      setServerError("Cannot connect to server. Make sure backend is running on port 5000.");
      setLoading(false);
    }
  };

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-left">
          {/* BACK BUTTON */}
          <button onClick={handleBack} style={{ position:"absolute", top:"20px", left:"20px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"10px", padding:"6px 14px", color:"rgba(255,255,255,0.8)", fontSize:"13px", cursor:"pointer", display:"flex", alignItems:"center", gap:"6px", zIndex:10 }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(124,58,237,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.08)"}>
            ← Back
          </button>
          <div className="signup-header">
            <h1>Create Your Account</h1>
            <p>Build your internship journey</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <span className="input-icon"><User size={16}/></span>
              <input type="text" placeholder="Full Name" value={formData.fullName} className={errors.fullName ? "error-border" : ""} onChange={e => set("fullName", e.target.value)} />
              {errors.fullName && <small>{errors.fullName}</small>}
            </div>
            <div className="input-group">
              <span className="input-icon"><Mail size={16}/></span>
              <input type="email" placeholder="Email Address" value={formData.email} className={errors.email ? "error-border" : ""} onChange={e => set("email", e.target.value)} />
              {errors.email && <small>{errors.email}</small>}
            </div>
            <div className="input-group">
              <span className="input-icon"><Shield size={16}/></span>
              <select value={formData.role} className={errors.role ? "error-border" : ""} onChange={e => set("role", e.target.value)}>
                <option value="">Choose Role</option>
                <option value="intern">Intern</option>
                <option value="mentor">Mentor</option>
                <option value="institution">Institution</option>
                <option value="admin">Admin</option>
              </select>
              <span className="select-arrow">⌄</span>
              {errors.role && <small>{errors.role}</small>}
            </div>
            <div className="input-group">
              <span className="input-icon"><Lock size={16}/></span>
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={formData.password} className={errors.password ? "error-border" : ""} onChange={e => set("password", e.target.value)} />
              <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</span>
              {errors.password && <small>{errors.password}</small>}
            </div>
            <div className="input-group">
              <span className="input-icon"><Lock size={16}/></span>
              <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={formData.confirmPassword} className={errors.confirmPassword ? "error-border" : ""} onChange={e => set("confirmPassword", e.target.value)} />
              <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</span>
              {errors.confirmPassword && <small>{errors.confirmPassword}</small>}
            </div>
            <label className="terms">
              <input type="checkbox" checked={formData.terms} onChange={e => set("terms", e.target.checked)} />
              <span>I agree to Terms & Conditions</span>
            </label>
            {errors.terms && <small className="terms-error">{errors.terms}</small>}
            {serverError && (
              <p style={{ color:"#ef4444", fontSize:"12px", textAlign:"center", margin:"8px 0", padding:"8px", background:"rgba(239,68,68,0.1)", borderRadius:"8px", border:"1px solid rgba(239,68,68,0.3)" }}>
                <AlertTriangle size={14} className="inline" style={{ verticalAlign:"middle", marginRight:4 }}/> {serverError}
              </p>
            )}
            <button type="submit" className="signup-btn" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creating account…" : "Continue"}
            </button>
          </form>
          <div className="divider"><span>or continue with</span></div>
          <div className="social-icons">
            <button className="social-btn">G</button>
            <button className="social-btn">GH</button>
            <button className="social-btn">in</button>
          </div>
          <p className="bottom-text">Already have an account? <Link href="/login"> Login</Link></p>
        </div>
        <div className="signup-right">
          <div className="overlay"></div>
          <div className="right-content">
            <h2>Smart Internship Portal</h2>
            <p>Discover internships, connect with mentors, and grow your career.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
