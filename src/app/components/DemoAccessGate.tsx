import { useState, type FormEvent } from 'react';
import { SimpleLogo } from './SimpleLogo';
import { grantDemoAccess, verifyDemoAccessCode } from '../utils/demo-access';

type DemoAccessGateProps = {
  onGranted: () => void;
};

export function DemoAccessGate({ onGranted }: DemoAccessGateProps) {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    if (verifyDemoAccessCode(accessCode)) {
      grantDemoAccess();
      onGranted();
      return;
    }

    setError('Invalid access code. Please try again or contact your Equisoft representative.');
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] px-4 py-10">
      <div className="w-full max-w-[400px] rounded-lg border border-border-default bg-white px-8 py-10 shadow-[0_2px_12px_rgba(27,28,30,0.06)]">
        <div className="mb-8 flex flex-col items-center text-center">
          <SimpleLogo className="h-7 w-[92px]" textFill="#1b1c1e" />
          <h1 className="mt-6 text-[22px] font-semibold leading-tight text-[#003a5a]">
            Amplify Case Management
          </h1>
          <p className="mt-2 text-[14px] text-text-secondary">Sign in to your account</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="demo-access-code" className="mb-1.5 block text-[13px] text-text-secondary">
              Access code <span className="text-brand-red">*</span>
            </label>
            <input
              id="demo-access-code"
              name="accessCode"
              type="password"
              autoComplete="off"
              autoFocus
              value={accessCode}
              onChange={(event) => {
                setAccessCode(event.target.value);
                if (error) setError(null);
              }}
              className="w-full rounded-md border border-border-default bg-[#f7f9fb] px-3 py-2.5 text-[14px] text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
              placeholder="Enter access code"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'demo-access-error' : undefined}
            />
          </div>

          {error ? (
            <p id="demo-access-error" className="text-[13px] leading-snug text-brand-red" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting || !accessCode.trim()}
            className="w-full rounded-md bg-[#003a5a] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-text-muted">
          Demo environment · Full authentication will be enabled in a future release.
        </p>
      </div>
    </div>
  );
}
