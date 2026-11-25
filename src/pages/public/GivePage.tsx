import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMeQuery } from "../../features/auth/authApi";
import {
  useFundsQuery,
  useInitializeGivingMutation,
} from "../../features/giving/givingApi";

type StoredUser = { firstName?: string; lastName?: string; email?: string };
function readStoredUser(): StoredUser | null {
  try {
    return JSON.parse(
      localStorage.getItem("lct_user") ?? "null",
    ) as StoredUser | null;
  } catch {
    return null;
  }
}

export function GivePage() {
  const { data: funds = [], isLoading } = useFundsQuery();
  const token = localStorage.getItem("lct_access_token");
  const { data: meResponse } = useMeQuery(undefined, { skip: !token });
  const [initialize, { isLoading: paying }] = useInitializeGivingMutation();
  const [fundId, setFundId] = useState("");
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState<"PAYSTACK" | "FLUTTERWAVE">(
    "PAYSTACK",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = readStoredUser();
    const current = meResponse?.data;
    const firstName = current?.firstName ?? stored?.firstName ?? "";
    const lastName = current?.lastName ?? stored?.lastName ?? "";
    const currentEmail = current?.email ?? stored?.email ?? "";
    if (!name && (firstName || lastName))
      setName(`${firstName} ${lastName}`.trim());
    if (!email && currentEmail) setEmail(currentEmail);
  }, [meResponse, name, email]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      const r = await initialize({
        fundId,
        amount: Number(amount),
        donorName: name.trim(),
        donorEmail: email.trim(),
        anonymous,
        provider,
      }).unwrap();
      const checkoutUrl = r?.checkoutUrl;
      if (
        typeof checkoutUrl !== "string" ||
        !/^https?:\/\//i.test(checkoutUrl)
      ) {
        throw new Error(
          "The payment provider did not return a valid checkout URL.",
        );
      }
      window.location.assign(checkoutUrl);
    } catch (error) {
      setMessage(
        error instanceof Error && error.message.includes("valid checkout URL")
          ? "The payment provider did not return a valid checkout link. Please try again later or contact the church office."
          : "Unable to initialize payment. Please check your details and payment gateway configuration.",
      );
    }
  }

  return (
    <div className="page">
      <div className="hero compact">
        <span className="eyebrow">GIVE WITH PURPOSE</span>
        <h1>Your generosity makes an impact.</h1>
        <p>
          Give securely to LifeChanger Touch Church. Payments are confirmed by
          the selected payment provider before a giving record is marked
          successful.
        </p>
      </div>
      <form className="form-card" onSubmit={submit}>
        <label>
          Giving fund
          <select
            required
            value={fundId}
            onChange={(e) => setFundId(e.target.value)}
          >
            <option value="">
              {isLoading ? "Loading funds..." : "Select a fund"}
            </option>
            {funds.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Amount (NGN)
          <input
            required
            min="100"
            step="0.01"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <div className="form-row">
          <label>
            Name
            <input
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        </div>
        <label>
          Payment provider
          <select
            value={provider}
            onChange={(e) =>
              setProvider(e.target.value as "PAYSTACK" | "FLUTTERWAVE")
            }
          >
            <option value="PAYSTACK">Paystack</option>
            <option value="FLUTTERWAVE">Flutterwave</option>
          </select>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
          />{" "}
          Give anonymously
        </label>
        {message && <div className="error">{message}</div>}
        <button className="button" disabled={paying || !fundId}>
          {paying ? "Preparing secure checkout…" : "Continue to secure payment"}
        </button>
        <small>
          Payments are processed by Paystack or Flutterwave. LCT never stores
          card details.
        </small>
      </form>
      <div style={{ marginTop: 28 }}>
        <Link to="/giving" className="back">
          View your giving history →
        </Link>
      </div>
    </div>
  );
}
