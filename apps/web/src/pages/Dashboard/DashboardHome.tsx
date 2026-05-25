import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { useAuth } from "../../context/AuthContext";

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <>
      <PageMeta title="Dashboard | LoomForm" description="Creator dashboard" />
      <PageBreadCrumb pageTitle="Dashboard" />
      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Create dynamic forms, publish shareable links, and collect responses.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/forms">
            <Button>Manage forms</Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          Role: <span className="font-medium text-brand-500">{user?.role}</span>
        </p>
      </div>
    </>
  );
}
