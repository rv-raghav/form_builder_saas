import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        email,
        password,
        password_confirm: passwordConfirm,
        name,
      });
      localStorage.setItem("lastLoginEmail", email);
    } catch (err: unknown) {
      setError((err as Error).message || "Registration failed.");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
  };

  useEffect(() => {
    if (!user) return;
    if (user.must_reset_password) {
      navigate("/set-password", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto" />
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Create account
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign up to start building forms.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-500 bg-red-50 p-2 text-sm text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  disabled={submitting}
                />
              </div>
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    required
                    disabled={submitting}
                  />
                  <span
                    onClick={() => !submitting && setShowPassword(!showPassword)}
                    className="absolute z-30 right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 size-5" />
                    )}
                  </span>
                </div>
              </div>
              <div>
                <Label>
                  Confirm password <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={passwordConfirm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPasswordConfirm(e.target.value)
                  }
                  required
                  disabled={submitting}
                />
              </div>
              <Button className="w-full" size="sm" type="submit" disabled={submitting}>
                {submitting ? "Creating account..." : "Sign up"}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/signin" className="text-brand-500 hover:text-brand-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
