import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ChevronDown, Menu, Radio, X } from "lucide-react";
import logo from "../../assets/logo.png";


type StoredUser = { permissions?: string[]; roles?: string[] };
function readStoredUser(): StoredUser | null {
  try {
    return JSON.parse(localStorage.getItem("lct_user") ?? "null");
  } catch {
    return null;
  }
}
const publicLinks = [
  ["Church TV", "/church-tv"],
  ["Sermons", "/sermons"],
  ["Events", "/events"],
  ["Announcements", "/announcements"],
  ["Give", "/give"],
  ["Prayer", "/prayer"],
  ["Bible", "/bible"],
  ["Bible Studies", "/bible-studies"],
  ["Devotionals", "/devotionals"],
] as const;
export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const authenticated = Boolean(localStorage.getItem("lct_access_token"));
  const permissions = readStoredUser()?.permissions ?? [];
  const canManageDevotionals = permissions.includes("DEVOTIONAL_MANAGE");
  const canManageBibleStudies = permissions.includes("BIBLE_STUDY_MANAGE");
  const canManageAnnouncements = permissions.includes("ANNOUNCEMENT_MANAGE");
  const storedUser = readStoredUser();
  const isSuperAdmin = (storedUser?.roles ?? []).includes("SUPER_ADMIN");
  const canViewEngagementAnalytics =
    (storedUser?.permissions ?? []).includes("ENGAGEMENT_ANALYTICS_VIEW") ||
    ["SUPER_ADMIN", "CHURCH_ADMIN", "PASTOR"].some((role) =>
      (storedUser?.roles ?? []).includes(role),
    );
  const closeMenu = () => setMenuOpen(false);
  const utilityLinks: readonly (readonly [string, string])[] = [
    ...(authenticated
      ? [
          ["My profile", "/profile"] as const,
          ["Notification settings", "/settings/notifications"] as const,
        ]
      : []),
    ...(authenticated && isSuperAdmin
      ? [["Manage users & roles", "/admin/users"] as const, ["Role permissions", "/admin/roles"] as const]
      : []),
    ...(authenticated && isSuperAdmin
      ? [["Manage Church TV", "/admin/church-tv"] as const]
      : []),
    ...(authenticated && canViewEngagementAnalytics
      ? [
          ["Church TV analytics", "/admin/church-tv/analytics"] as const,
          ["Engagement analytics", "/admin/engagement-analytics"] as const,
        ]
      : []),
    ...(authenticated && canManageDevotionals
      ? [
          ["Manage devotionals", "/admin/devotionals"] as const,
          ["Manage reading plans", "/admin/reading-plans"] as const,
        ]
      : []),
    ...(authenticated && canManageAnnouncements
      ? [["Manage announcements", "/admin/announcements"] as const]
      : []),
    ...(authenticated && canManageBibleStudies
      ? [["Manage Bible studies", "/admin/bible-studies"] as const]
      : []),
  ];
  const submenuActive = utilityLinks.some(
    ([, path]) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`),
  );
  const navLinkClass = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`)
      ? "text-purple-900"
      : "text-slate-600 transition hover:text-purple-800";
  return (
    <div className="min-h-screen bg-[#fbfafc] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-purple-100/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-8">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-purple-800 text-lg font-black text-white shadow-lg shadow-purple-900/20">
               <a href="/" className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Application logo"
                  className="h-12 w-auto object-contain"
                />         
              </a>
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black tracking-wide text-purple-900">
                LIFECHANGERS TOUCH
              </div>
              <div className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 sm:block">
                Experience God's Presence. Anywhere. Anytime.
              </div>
            </div>
          </Link>
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-5 text-sm font-semibold xl:flex"
          >
            {publicLinks.map(([label, path]) => (
              <Link key={label} to={path} className={navLinkClass(path)}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            {authenticated ? (
              <Link
                to="/dashboard"
                className="text-sm font-bold text-purple-800 hover:text-purple-950"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-bold text-purple-800 hover:text-purple-950"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-bold text-purple-800 hover:text-purple-950"
                >
                  Join us
                </Link>
              </>
            )}
            <Link
              to="/church-tv"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-800 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-purple-900/20 hover:bg-purple-900"
            >
              <Radio size={16} /> Watch Live
            </Link>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("account-management-menu")
                  ?.toggleAttribute("data-open")
              }
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold ${submenuActive ? "border-purple-300 bg-purple-50 text-purple-900" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
              aria-controls="account-management-menu"
            >
              More <ChevronDown size={15} />
            </button>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/church-tv"
              aria-label="Watch live church TV"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-800 px-3 py-2.5 text-sm font-bold text-white"
            >
              <Radio size={16} />
              <span className="hidden sm:inline">Watch Live</span>
            </Link>
            <button
              type="button"
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex size-11 items-center justify-center rounded-xl border border-purple-200 bg-white text-purple-900 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {utilityLinks.length > 0 && (
          <div
            id="account-management-menu"
            className="hidden border-t border-purple-100 bg-purple-50/60 data-[open]:block"
          >
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-1 px-5 py-2 text-sm font-semibold lg:px-8">
              <span className="mr-1 text-xs font-black uppercase tracking-wider text-purple-700">
                Account &amp; management
              </span>
              {utilityLinks.map(([label, path]) => (
                <Link
                  key={path}
                  to={path}
                  className={`rounded-lg px-2 py-1.5 ${navLinkClass(path)}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
        {menuOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="border-t border-purple-100 bg-white px-4 py-3 shadow-lg lg:hidden"
          >
            <div className="mx-auto grid max-w-7xl gap-1">
              {publicLinks.map(([label, path]) => (
                <Link
                  key={label}
                  to={path}
                  onClick={closeMenu}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${location.pathname === path ? "bg-purple-50 text-purple-900" : "text-slate-700 hover:bg-purple-50 hover:text-purple-900"}`}
                >
                  {label}
                </Link>
              ))}
              {utilityLinks.length > 0 && (
                <details
                  className="mt-2 border-t border-slate-100 pt-2"
                  open={submenuActive}
                >
                  <summary className="cursor-pointer rounded-xl px-4 py-3 text-sm font-bold text-purple-800">
                    Account &amp; management
                  </summary>
                  <div className="grid gap-1 pl-3">
                    {utilityLinks.map(([label, path]) => (
                      <Link
                        key={path}
                        to={path}
                        onClick={closeMenu}
                        className={`rounded-xl px-4 py-3 text-sm font-semibold ${navLinkClass(path)}`}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </details>
              )}
              <div className="my-2 border-t border-slate-100" />
              {authenticated ? (
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-purple-800 hover:bg-purple-50"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-purple-800 hover:bg-purple-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-purple-800 hover:bg-purple-50"
                  >
                    Join us
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 text-sm text-slate-500 lg:px-8">
          © {new Date().getFullYear()} LifeChangers Touch Church. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
