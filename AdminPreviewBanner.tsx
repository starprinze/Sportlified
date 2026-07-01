import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard } from "lucide-react";

/**
 * Floating pill shown to admins/organizers on public pages.
 * Positioned bottom-right, above the mobile nav, always tappable.
 */
export default function AdminPreviewBanner() {
  const { canManage, isSuperAdmin } = useAuth();
  if (!canManage) return null;

  const returnTo = isSuperAdmin ? "/super-admin" : "/organizer";

  return (
    <Link
      to={returnTo}
      className="fixed bottom-20 right-4 z-[9999] flex items-center gap-2
                 bg-primary text-primary-foreground shadow-lg
                 rounded-full px-4 py-2.5 text-xs font-bold
                 hover:bg-primary/90 active:scale-95 transition-all
                 border border-white/20"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
      Dashboard
    </Link>
  );
}
