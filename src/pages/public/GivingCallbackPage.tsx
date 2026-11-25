import { useEffect,  useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useVerifyGivingQuery } from "../../features/giving/givingApi";

type Provider = "PAYSTACK" | "FLUTTERWAVE";
export function GivingCallbackPage() {
  const [params] = useSearchParams();
  const reference =
    params.get("reference") ||
    params.get("trxref") ||
    params.get("tx_ref") ||
    "";
  const providerParam = (
    params.get("provider") || (params.has("trxref") ? "PAYSTACK" : "")
  ).toUpperCase();
  const provider = (
    providerParam === "PAYSTACK" || providerParam === "FLUTTERWAVE"
      ? providerParam
      : ""
  ) as Provider | "";
  const canVerify = Boolean(reference && provider);
  const { data, error, isLoading } = useVerifyGivingQuery(
    { provider: provider as Provider, reference },
    { skip: !canVerify, refetchOnMountOrArgChange: true },
  );
  const [timedOut, setTimedOut] = useState(false);
//   const started = useRef(false);
  useEffect(() => {
    if (data || error || !canVerify) setTimedOut(false);
  }, [data, error, canVerify]);
  useEffect(() => {
    if (!canVerify) setTimedOut(true);
  }, [canVerify]);
  const success = data?.status?.toUpperCase() === "SUCCESS";
  const failed = Boolean(error) || data?.status?.toUpperCase() === "FAILED";
  return (
    <div className="page">
      <div className="form-card">
        <span className="eyebrow">SECURE GIVING</span>
        <h1>
          {isLoading
            ? "Confirming your payment…"
            : success
              ? "Thank you for giving!"
              : failed
                ? "Payment not confirmed"
                : "Checking your payment"}
        </h1>
        {isLoading && (
          <p>
            We are verifying your transaction with{" "}
            {provider === "PAYSTACK" ? "Paystack" : "Flutterwave"}. Please keep
            this page open.
          </p>
        )}
        {success && (
          <>
            <p>Your payment has been verified and recorded by LCT.</p>
            <p>
              <strong>Reference:</strong> {data?.reference}
            </p>
            <p>
              <strong>Status:</strong> {data?.status}
            </p>
          </>
        )}
        {failed && (
          <p>
            We could not confirm this payment. If your provider shows a
            successful charge, please do not pay again yet. Contact the church
            office with your transaction reference.
          </p>
        )}
        {timedOut && !success && !failed && (
          <p>
            The callback URL is missing a supported provider or transaction
            reference. Please use your payment provider's return link or contact
            the church office.
          </p>
        )}
        {!isLoading && (
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 20,
            }}
          >
            <Link className="button" to="/giving">
              View giving history
            </Link>
            <Link className="back" to="/give">
              Return to giving
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
