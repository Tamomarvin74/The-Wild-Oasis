 // pages/login.js
import { useState } from "react";
// We no longer import signIn from "next-auth/react" for the initial login
// Instead, we will directly use Supabase for authentication.
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase"; // Import the Supabase client

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); // Clear previous errors
    setIsLoading(true);

    try {
      // Directly authenticate with Supabase using email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase signInWithPassword error:", error);
        // Display a more user-friendly error message based on Supabase's error
        if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(`Login failed: ${error.message || "An unexpected error occurred."}`);
        }
      } else if (data.user) {
        // If Supabase authentication is successful, the user is logged in via Supabase.
        // Now, we need to ensure NextAuth also recognizes this session.
        // The simplest way to do this is to redirect to a protected page.
        // NextAuth's getServerSideProps on the protected page will then pick up the Supabase session.
        console.log("Supabase login successful, redirecting to /account.");
        router.push("/account");
      } else {
        // This case should ideally not be hit if data.user is null and no error,
        // but it's a fallback.
        setError("Login failed. No user data returned.");
      }
    } catch (err) {
      console.error("Unexpected error during login:", err);
      setError("An unexpected error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary-950 text-primary-100">
      <h1 className="text-4xl font-semibold mb-8 text-accent-400">
        Log In {/* Changed from "Log in to The Wild Oasis" */}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 rounded-md bg-primary-800 border border-primary-700 text-primary-100 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 rounded-md bg-primary-800 border border-primary-700 text-primary-100 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent-500"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-accent-500 hover:bg-accent-600 text-primary-800 font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>
        {error && <p className="text-red-500 text-center">{error}</p>}
      </form>
    </div>
  );
}

export default LoginPage;
