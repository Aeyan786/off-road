import Login from "@/components/auth/Login";

export const metadata = {
  title: "Sign In | Off Road Performance",
};

const NOTICES = {
  "no-access": "This account doesn't have access to the admin portal.",
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Login notice={NOTICES[params?.error] ?? null} />
    </main>
  );
}
