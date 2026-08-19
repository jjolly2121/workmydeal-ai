import { useState } from "react";

import { apiFetch } from "../api";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(event) {
    event.preventDefault();
    setError("");

    apiFetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Login failed.");
        }

        return response.json();
      })
      .then((result) => {
        onLogin(result.user, result.token);
      })
      .catch(() => {
        setError("Invalid email or password.");
      });
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-logo-mark">↗</div>

        <h1>WorkMyDeal</h1>

        <p>Prioritize. Execute. Close.</p>
      </section>

      <section className="login-card">
        <h2>Welcome Back</h2>

        <p className="subtitle">Please sign in to continue</p>

        <form className="login-actions" onSubmit={handleLogin}>
          <label>
            Email
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="work-button" type="submit">
            Sign In
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
