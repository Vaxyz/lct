import { Link, useParams } from "react-router-dom";
import { useGetStudyQuery } from "../../features/bibleStudy/bibleStudyApi";
export function BibleStudyDetailPage() {
  const { id = "" } = useParams();
  const { data, isLoading, error } = useGetStudyQuery(id, { skip: !id });
  const s = data?.data;
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <Link to="/bible-studies" className="text-purple-700">
        ← All Bible studies
      </Link>
      {isLoading && <p>Loading study…</p>}
      {error && (
        <p role="alert">
          This study could not be loaded. It may have been unpublished or
          removed.
        </p>
      )}
      {s && (
        <>
          <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-purple-700">
              {s.topic || s.seriesName || "Bible study"}
            </p>
            <h1 className="mt-2 text-3xl font-bold">{s.title}</h1>
            {s.summary && (
              <p className="mt-3 text-lg text-slate-600">{s.summary}</p>
            )}
          </header>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Lessons</h2>
            {(s.lessons || []).map((l) => (
              <article
                key={l.id || l.lessonNumber}
                className="space-y-3 rounded-xl border p-5"
              >
                <p className="text-sm font-semibold text-purple-700">
                  Lesson {l.lessonNumber}
                </p>
                <h3 className="text-xl font-semibold">{l.title}</h3>
                {l.scriptureReference && (
                  <p>
                    <strong>Scripture:</strong>{" "}
                    <Link
                      className="text-purple-700 underline"
                      to={`/bible?reference=${encodeURIComponent(l.scriptureReference)}`}
                    >
                      {l.scriptureReference}
                    </Link>
                  </p>
                )}
                {l.teachingNotes && (
                  <div>
                    <h4 className="font-semibold">Teaching notes</h4>
                    <p className="whitespace-pre-wrap text-slate-700">
                      {l.teachingNotes}
                    </p>
                  </div>
                )}
                {l.discussionQuestions && (
                  <div>
                    <h4 className="font-semibold">Discussion questions</h4>
                    <p className="whitespace-pre-wrap text-slate-700">
                      {l.discussionQuestions}
                    </p>
                  </div>
                )}
                {l.reflectionPrompt && (
                  <div>
                    <h4 className="font-semibold">Reflect</h4>
                    <p className="whitespace-pre-wrap text-slate-700">
                      {l.reflectionPrompt}
                    </p>
                  </div>
                )}
              </article>
            ))}
            {!s.lessons?.length && (
              <p className="rounded-lg bg-slate-50 p-4">
                Lessons for this study have not been published yet.
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
