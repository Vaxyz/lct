import { useMyGivingQuery } from "../../features/giving/givingApi";
export function GivingHistoryPage() {
  const { data = [], isLoading } = useMyGivingQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  return (
    <div className="page">
      <div className="hero compact">
        <span className="eyebrow">MY GIVING</span>
        <h1>Giving history</h1>
      </div>
      {isLoading ? (
        <p>Loading…</p>
      ) : data.length === 0 ? (
        <div className="empty">
          <h3>No giving records yet</h3>
          <p>Your completed giving will appear here.</p>
        </div>
      ) : (
        <div className="admin-list">
          {data.map((t) => (
            <div className="admin-row" key={t.id}>
              <div>
                <strong>
                  ₦{Number(t.amount).toLocaleString()} · {t.provider}
                </strong>
                <small>
                  {t.reference} ·{" "}
                  {new Date(t.createdAt ?? Date.now()).toLocaleString()}
                </small>
              </div>
              <span className={t.status === "SUCCESS" ? "success" : "badge"}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
