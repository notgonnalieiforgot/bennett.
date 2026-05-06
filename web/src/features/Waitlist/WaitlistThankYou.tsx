interface Props {
  applicationId: string;
}

/**
 * Post-submit screen. Voice intentionally tight — no "we'll review carefully"
 * corporate energy. Per spec §10c the founder is the one reading.
 */
export function WaitlistThankYou({ applicationId }: Props) {
  return (
    <section className="max-w-md mx-auto p-8 space-y-4 text-center">
      <h1 className="text-3xl font-extrabold lowercase">u submitted.</h1>
      <p className="text-muted text-sm lowercase">
        the founder reads every application personally.
        <br />
        if u get picked, u get an email with an invite code.
      </p>
      <p className="text-muted text-[11px] lowercase">
        application id: <span className="font-mono">{applicationId}</span>
      </p>
    </section>
  );
}
