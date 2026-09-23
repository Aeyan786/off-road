import Breadcrumbs from "@/components/admin/Breadcrumbs";
import SetupRequiredBanner from "@/components/admin/SetupRequiredBanner";
import EmailTemplateEditor from "@/components/admin/templates/EmailTemplateEditor";
import { getEmailSettings } from "@/lib/data/emailTemplates";

export const metadata = {
  title: "Email Templates",
};

// Requires the "Email Templates" permission — enforced by proxy.js and the
// save actions (lib/admin-modules.js).
export default async function EmailTemplatesPage() {
  let settings = null;
  let setupError = null;
  try {
    settings = await getEmailSettings();
  } catch (err) {
    setupError = err.message;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Email Templates" }]} />
        <h1 className="text-2xl font-bold text-neutral-900">Email Templates</h1>
        <p className="text-sm text-neutral-500">
          Edit the wording and colours of the emails customers receive about their orders.
          The layout, item list, totals and addresses are filled in automatically.
        </p>
      </div>

      {setupError ? (
        <SetupRequiredBanner message={setupError} migration="0011_email_templates.sql" />
      ) : (
        <EmailTemplateEditor initialTemplates={settings.templates} initialTheme={settings.theme} />
      )}
    </div>
  );
}
