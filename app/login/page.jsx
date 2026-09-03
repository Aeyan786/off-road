import Login from "@/components/auth/Login";

export const metadata = {
  title: "Sign In | Off Road Performance",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Login />
    </main>
  );
}
