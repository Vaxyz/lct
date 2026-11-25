import { Navigate, Route, Routes } from "react-router-dom";
import { PublicLayout } from "./components/layout/PublicLayout";
import { HomePage } from "./pages/public/HomePage";
import { LoginPage } from "./pages/public/LoginPage";
import { RegisterPage } from "./pages/public/RegisterPage";
import { DashboardPage } from "./pages/member/DashboardPage";
import { ChurchTvPage } from "./pages/public/ChurchTvPage";
import { SermonsPage } from "./pages/public/SermonsPage";
import { SermonDetailPage } from "./pages/public/SermonDetailPage";
import { MediaAdminPage } from "./pages/admin/MediaAdminPage";
import { EventsPage } from "./pages/public/EventsPage";
import { EventDetailPage } from "./pages/public/EventDetailPage";
import { EventAdminPage } from "./pages/admin/EventAdminPage";
import { GivePage } from "./pages/public/GivePage";
import { GivingCallbackPage } from "./pages/public/GivingCallbackPage";
import { GivingAdminPage } from "./pages/admin/GivingAdminPage";
import { GivingHistoryPage } from "./pages/member/GivingHistoryPage";
import { PrayerPage } from "./pages/public/PrayerPage";
import { MyPrayerRequestsPage } from "./pages/member/MyPrayerRequestsPage";
import { PrayerAdminPage } from "./pages/admin/PrayerAdminPage";
import { BiblePage } from "./pages/public/BiblePage";
import { DevotionalsPage } from "./pages/public/DevotionalsPage";
import { DevotionalJournalPage } from "./pages/member/DevotionalJournalPage";
import { DevotionalDetailPage } from "./pages/public/DevotionalDetailPage";
import { DevotionalAdminPage } from "./pages/admin/DevotionalAdminPage";
import { ReadingPlanAdminPage } from "./pages/admin/ReadingPlanAdminPage";
import { ReadingPlanDetailPage } from "./pages/public/ReadingPlanDetailPage";
import { BibleStudyAdminPage } from "./pages/admin/BibleStudyAdminPage";
import { BibleStudiesPage } from "./pages/public/BibleStudiesPage";
import { BibleStudyDetailPage } from "./pages/public/BibleStudyDetailPage";
import { AnnouncementAdminPage } from "./pages/admin/AnnouncementAdminPage";
import { AnnouncementsPage } from "./pages/public/AnnouncementsPage";
import { NotificationPreferencesPage } from "./pages/member/NotificationPreferencesPage";
import { ProfilePage } from "./pages/member/ProfilePage";
import { UserManagementPage } from "./pages/admin/UserManagementPage";
import { ChurchTvAdminPage } from "./pages/admin/ChurchTvAdminPage";
import { EngagementAnalyticsPage } from "./pages/admin/EngagementAnalyticsPage";
import { ChurchTvViewerAnalyticsPage } from "./pages/admin/ChurchTvViewerAnalyticsPage";
import { LeadershipDashboardPage } from "./pages/admin/LeadershipDashboardPage";
import { RolePermissionManagementPage } from "./pages/admin/RolePermissionManagementPage";
import type { ReactNode } from "react";

type StoredUser = { permissions?: string[]; roles?: string[] };
function storedUser(): StoredUser | null {
  try {
    return JSON.parse(localStorage.getItem("lct_user") ?? "null");
  } catch {
    return null;
  }
}
function Protected({ children }: { children: ReactNode }) {
  return localStorage.getItem("lct_access_token") ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}
function SuperAdminProtected({ children }: { children: ReactNode }) {
  const user = storedUser();
  if (!localStorage.getItem("lct_access_token"))
    return <Navigate to="/login" replace />;
  if (!(user?.roles ?? []).includes("SUPER_ADMIN"))
    return <Navigate to="/dashboard" replace />;
  return children;
}
function PermissionProtected({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const user = storedUser();
  if (!localStorage.getItem("lct_access_token"))
    return <Navigate to="/login" replace />;
  if (!(user?.permissions ?? []).includes(permission))
    return <Navigate to="/dashboard" replace />;
  return children;
}
function AnalyticsProtected({ children }: { children: ReactNode }) {
  const user = storedUser();
  if (!localStorage.getItem("lct_access_token"))
    return <Navigate to="/login" replace />;
  const allowedByRole = ["SUPER_ADMIN", "CHURCH_ADMIN", "PASTOR"].some((role) =>
    (user?.roles ?? []).includes(role),
  );
  if (
    !allowedByRole &&
    !(user?.permissions ?? []).includes("ENGAGEMENT_ANALYTICS_VIEW")
  )
    return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/bible" element={<BiblePage />} />
        <Route path="/bible-studies" element={<BibleStudiesPage />} />
        <Route path="/bible-studies/:id" element={<BibleStudyDetailPage />} />
        <Route path="/devotionals" element={<DevotionalsPage />} />
        <Route path="/devotionals/:slug" element={<DevotionalDetailPage />} />
        <Route
          path="/devotionals/journal"
          element={
            <Protected>
              <DevotionalJournalPage />
            </Protected>
          }
        />
        <Route path="/reading-plans/:id" element={<ReadingPlanDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <DashboardPage />
            </Protected>
          }
        />
        <Route
          path="/profile"
          element={
            <Protected>
              <ProfilePage />
            </Protected>
          }
        />
        <Route
          path="/admin/users"
          element={
            <SuperAdminProtected>
              <UserManagementPage />
            </SuperAdminProtected>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <SuperAdminProtected>
              <RolePermissionManagementPage />
            </SuperAdminProtected>
          }
        />
        <Route
          path="/admin/church-tv"
          element={
            <SuperAdminProtected>
              <ChurchTvAdminPage />
            </SuperAdminProtected>
          }
        />
        <Route
          path="/settings/notifications"
          element={
            <Protected>
              <NotificationPreferencesPage />
            </Protected>
          }
        />
        <Route path="/church-tv" element={<ChurchTvPage />} />
        <Route path="/sermons" element={<SermonsPage />} />
        <Route path="/sermons/:slug" element={<SermonDetailPage />} />
        <Route path="/prayer" element={<PrayerPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />
        <Route path="/give" element={<GivePage />} />
        <Route path="/give/callback" element={<GivingCallbackPage />} />
        <Route
          path="/giving"
          element={
            <Protected>
              <GivingHistoryPage />
            </Protected>
          }
        />
        <Route
          path="/prayer/mine"
          element={
            <Protected>
              <MyPrayerRequestsPage />
            </Protected>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <PermissionProtected permission="ANNOUNCEMENT_MANAGE">
              <AnnouncementAdminPage />
            </PermissionProtected>
          }
        />
        <Route
          path="/admin/bible-studies"
          element={
            <PermissionProtected permission="BIBLE_STUDY_MANAGE">
              <BibleStudyAdminPage />
            </PermissionProtected>
          }
        />
        <Route
          path="/admin/devotionals"
          element={
            <PermissionProtected permission="DEVOTIONAL_MANAGE">
              <DevotionalAdminPage />
            </PermissionProtected>
          }
        />
        <Route
          path="/admin/reading-plans"
          element={
            <PermissionProtected permission="DEVOTIONAL_MANAGE">
              <ReadingPlanAdminPage />
            </PermissionProtected>
          }
        />

        <Route
          path="/admin/media"
          element={
            <PermissionProtected permission="SERMON_CREATE">
              <MediaAdminPage />
            </PermissionProtected>
          }
        />
        <Route
          path="/admin/events"
          element={
            <PermissionProtected permission="EVENT_CREATE">
              <EventAdminPage />
            </PermissionProtected>
          }
        />
        <Route
          path="/admin/leadership-dashboard"
          element={
            <AnalyticsProtected>
              <LeadershipDashboardPage />
            </AnalyticsProtected>
          }
        />
        <Route
          path="/admin/engagement-analytics"
          element={
            <AnalyticsProtected>
              <EngagementAnalyticsPage />
            </AnalyticsProtected>
          }
        />
        <Route
          path="/admin/church-tv/analytics"
          element={
            <AnalyticsProtected>
              <ChurchTvViewerAnalyticsPage />
            </AnalyticsProtected>
          }
        />
        <Route
          path="/admin/giving"
          element={
            <PermissionProtected permission="GIVING_REPORT_VIEW">
              <GivingAdminPage />
            </PermissionProtected>
          }
        />
        <Route
          path="/admin/prayer"
          element={
            <PermissionProtected permission="PRAYER_MANAGE">
              <PrayerAdminPage />
            </PermissionProtected>
          }
        />
      </Route>
    </Routes>
  );
}
