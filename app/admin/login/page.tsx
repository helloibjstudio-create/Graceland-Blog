import { redirect } from "next/navigation";
import { BrandMark } from "@/components/icons";
import LoginForm from "@/components/admin/login-form";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");

  const configured = Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH);

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand">
          <BrandMark />
          <span className="brand-text">
            <span className="brand-name">GRACELAND</span>
            <span className="brand-sub">Content Studio</span>
          </span>
        </div>

        <h1>Sign in</h1>
        <p>Admin access for the blog and podcast content studio.</p>

        {configured ? (
          <LoginForm />
        ) : (
          <div className="alert alert-error">
            No admin account is configured yet. Run{" "}
            <code>npm run admin:create -- you@example.com &quot;your-password&quot;</code> in the
            project root, then restart the dev server.
          </div>
        )}
      </div>
    </div>
  );
}
