import AuthImage from "./auth-image";
import SignInForm from "./signin-form";
import CookieConsentModal from "./cookie-consent-modal";

export const metadata = {
  title: "Login",
  description: "Login page",
  layout: "fullscreen",
};

export default function SignInPage() {
  return (
    <main className="relative min-h-screen bg-background dark:bg-background-dark">
      <div className="md:flex h-screen">
        {/* Levý sloupec: obsahuje interaktivní formulář a hlavičku */}
        <div className="w-full md:w-1/2 h-full flex flex-col">
          <SignInForm />
        </div>
        {/* Pravý sloupec: pozadí */}
        <div className="hidden md:block w-1/2 h-full relative">
          <AuthImage />
        </div>
      </div>
      <CookieConsentModal />
    </main>
  );
}
