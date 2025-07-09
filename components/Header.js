 // components/Header.js
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react"; // Import useSession and signOut
import Logo from "./Logo"; // Assuming Logo component exists

function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="bg-primary-900 py-4 px-8 border-b border-primary-700">
      <nav className="max-w-7xl mx-auto flex justify-between items-center">
        <Logo /> {/* Assuming your Logo component is here */}
        <ul className="flex gap-8">
          <li>
            {/* Added text-primary-100 for white text color */}
            <Link href="/cabins" className="text-primary-100 hover:text-accent-400">
              Cabins
            </Link>
          </li>
          <li>
            {/* Added text-primary-100 for white text color */}
            <Link href="/about" className="text-primary-100 hover:text-accent-400">
              About
            </Link>
          </li>
          <li>
            {/* Added text-primary-100 for white text color */}
            <Link href="/contact" className="text-primary-100 hover:text-accent-400">
              Contact
            </Link>
          </li>
          <li>
            {status === "loading" && <span className="text-primary-200">Loading...</span>}
            {status === "authenticated" && session.user ? (
              <div className="flex items-center gap-4">
                <Link href="/account" className="text-primary-100 hover:text-accent-400 flex items-center gap-2">
                  <img
                    src={session.user.image || "/default-user.jpg"} // Use default image if none provided
                    alt={session.user.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <span>{session.user.name}</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })} // Redirect to home after logout
                  className="bg-accent-600 hover:bg-accent-700 text-primary-800 font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              // Added text-primary-100 for white text color
              <Link href="/login" className="text-primary-100 hover:text-accent-400">
                Login
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
