import { useState } from "react";
import { useGameStore } from "../store/useGameStore";

export default function LoginPage() {
  const login = useGameStore((state) => state.login);
  const register = useGameStore((state) => state.register);
  const signInAsGuest = useGameStore((state) => state.signInAsGuest);
  const authLoading = useGameStore((state) => state.authLoading);
  const authError = useGameStore((state) => state.authError);
  const [authMode, setAuthMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      return;
    }

    if (authMode === "join") {
      if (password !== confirmPassword) {
        return;
      }

      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      return;
    }

    await login({ email: email.trim(), password });
  }

  const isJoinMode = authMode === "join";
  const canSubmit =
    !authLoading &&
    email.trim() &&
    password.trim() &&
    (!isJoinMode || (name.trim() && confirmPassword.trim() && confirmPassword === password));

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-300/70 bg-white/80 p-6 shadow-2xl shadow-slate-300/30 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:shadow-black/30">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-400">PuzzleFinder</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{isJoinMode ? "Join" : "Sign in"}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {isJoinMode
            ? "Create your account to save route progress and synced AI history."
            : "Connect to your backend account to unlock live chat, map progress, and photo verification."}
        </p>

        <div className="mt-5 grid grid-cols-2 rounded-xl border border-slate-300 bg-white p-1 dark:border-white/10 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setAuthMode("signin")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              !isJoinMode
                ? "bg-cyan-400 text-slate-950"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("join")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              isJoinMode
                ? "bg-cyan-400 text-slate-950"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            Join
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isJoinMode ? (
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {isJoinMode ? (
            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
              />
              {confirmPassword && password !== confirmPassword ? (
                <p className="mt-2 text-xs text-rose-500 dark:text-rose-300">Passwords do not match.</p>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
          >
            {authLoading ? (isJoinMode ? "Creating account..." : "Signing in...") : isJoinMode ? "Join now" : "Sign in"}
          </button>

          <button
            type="button"
            onClick={signInAsGuest}
            disabled={authLoading}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-cyan-300/50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
          >
            Sign in as Guest
          </button>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Guest mode has limited account features. You can play normally, but progress and chat history are not saved.
          </p>
        </form>

        {authError ? (
          <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{authError}</p>
        ) : null}
      </div>
    </div>
  );
}
