import { useState } from "react";
import { Pagination } from "../../components/ui/Pagination";
import { useGetAnnouncementsQuery } from "../../features/announcements/announcementsApi";
export function AnnouncementsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const { data, isLoading, error } = useGetAnnouncementsQuery(undefined, {
    pollingInterval: 30000,
  });
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-purple-700">
          LifeChanger Touch
        </p>
        <h1 className="text-3xl font-bold">Church Announcements</h1>
        <p className="mt-2 text-slate-600">
          Updates and notices from our church community.
        </p>
      </header>
      {isLoading && <p>Loading announcements…</p>}
      {error && (
        <p role="alert">
          Announcements could not be loaded. Please try again later.
        </p>
      )}
      {(data?.data ?? []).slice((page - 1) * pageSize, page * pageSize).map((a) => (
        <article
          key={a.id}
          className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"
        >
          <h2 className="text-xl font-bold text-purple-950">{a.title}</h2>
          <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">
            {a.body}
          </p>
          {a.publishedAt && (
            <p className="mt-4 text-xs text-slate-500">
              Published {new Date(a.publishedAt).toLocaleString()}
            </p>
          )}
        </article>
      ))}
      {!isLoading && !error && <Pagination page={page} pageSize={pageSize} totalItems={(data?.data ?? []).length} onPageChange={setPage} label="announcements" />}
      {!isLoading && !error && !data?.data?.length && (
        <div className="rounded-xl border border-dashed p-8 text-center text-slate-600">
          There are no published announcements at the moment.
        </div>
      )}
    </main>
  );
}
