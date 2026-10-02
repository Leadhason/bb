import { getStoreSettings } from "./actions";
import StoreSettingsForm from "./StoreSettingsForm";
import { Breadcrumb } from "@/components/Breadcrumb";

export default async function SettingsPage() {
  const storeSettings = await getStoreSettings();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Settings" },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Storefront Settings
        </h1>
        <p className="text-text-muted">
          Manage your social links
        </p>
      </div>

      <div className="bg-surface rounded-lg border border-border-default p-6">
        {storeSettings ? (
          <StoreSettingsForm initialData={storeSettings} />
        ) : (
          <p className="text-text-muted">Unable to load settings</p>
        )}
      </div>
    </div>
  );
}
