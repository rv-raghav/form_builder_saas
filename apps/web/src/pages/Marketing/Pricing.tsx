import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For solo creators getting started.",
    features: ["Up to 3 forms", "100 responses/month", "Basic themes"],
  },
  {
    name: "Pro",
    price: "$19",
    description: "For growing teams and campaigns.",
    features: ["Unlimited forms", "Analytics", "Custom themes", "Email notifications"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Contact",
    description: "For organizations at scale.",
    features: ["SSO", "Admin roles", "Priority support"],
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="text-xl font-semibold">
          ChaiForms
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/signin" className="text-gray-300 hover:text-white">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-lg bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="mb-4 text-center text-4xl font-bold">Simple pricing</h1>
        <p className="mb-12 text-center text-gray-400">
          No real payments in this demo — plans for showcase only.
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-brand-500 bg-gray-900"
                  : "border-gray-800 bg-gray-900/50"
              }`}
            >
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="mt-2 text-3xl font-bold">{plan.price}</p>
              <p className="mt-2 text-sm text-gray-400">{plan.description}</p>
              <ul className="mt-6 space-y-2 text-sm text-gray-300">
                {plan.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
