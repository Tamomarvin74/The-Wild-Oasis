 // pages/_app.js
import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import Header from "../components/Header";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Header />
      <div className="flex-1 px-8 py-12 grid">
        <main className="max-w-7xl mx-auto w-full">
          <Component {...pageProps} />
        </main>
      </div>
    </SessionProvider>
  );
}

export default MyApp;
