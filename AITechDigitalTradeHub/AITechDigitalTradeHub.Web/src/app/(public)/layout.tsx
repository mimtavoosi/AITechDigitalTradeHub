import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicNavigationDock } from "@/components/layout/public-navigation-dock";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main className="pb-28 lg:pb-24">{children}</main>
      <PublicNavigationDock />
      <PublicFooter />
    </div>
  );
}
