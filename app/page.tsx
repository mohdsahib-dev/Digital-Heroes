import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold">
            Digital Heroes
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900"
            >
              Login
            </Link>

            <Link
              href="/auth"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200"
            >
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              Golf • Community • Rewards
            </p>

            <h1 className="mt-5 text-5xl font-bold leading-tight md:text-7xl">
              Play golf.
              <br />
              Earn rewards.
              <br />
              Give back.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Digital Heroes brings together golf performance,
              monthly prize draws and charitable giving in one
              membership experience.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth"
                className="rounded-lg bg-white px-6 py-3 text-center font-semibold text-slate-950 hover:bg-slate-200"
              >
                Become a Member
              </Link>

              <Link
                href="/auth"
                className="rounded-lg border border-slate-700 px-6 py-3 text-center font-semibold text-white hover:bg-slate-900"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            Membership Experience
          </p>

          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Everything in one place.
          </h2>

          <p className="mt-4 text-slate-400">
            Track your golf activity, participate in monthly
            rewards and contribute to causes that matter.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <FeatureCard
            title="Golf Tracking"
            description="Record your golf rounds and keep track of your Stableford performance."
          />

          <FeatureCard
            title="Monthly Prize Draws"
            description="Enter scheduled monthly prize draws and view your winning results."
          />

          <FeatureCard
            title="Charity"
            description="Make contributions to causes including education, healthcare and community development."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              How It Works
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Three simple steps.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <StepCard
              number="01"
              title="Join"
              description="Create your Digital Heroes membership account."
            />

            <StepCard
              number="02"
              title="Play"
              description="Record your golf rounds and participate in monthly draws."
            />

            <StepCard
              number="03"
              title="Give Back"
              description="Support charitable causes through your membership experience."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center md:p-14">
          <h2 className="text-3xl font-bold md:text-4xl">
            Ready to become a Digital Hero?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Join the platform and start tracking your golf,
            entering prize draws and contributing to charity.
          </p>

          <Link
            href="/auth"
            className="mt-8 inline-block rounded-lg bg-white px-7 py-3 font-semibold text-slate-950 hover:bg-slate-200"
          >
            Join Digital Heroes
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Digital Heroes</p>

          <div className="flex gap-5">
            <Link href="/auth" className="hover:text-white">
              Login
            </Link>

            <Link href="/auth" className="hover:text-white">
              Join
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
      <h3 className="text-xl font-semibold">{title}</h3>

      <p className="mt-3 leading-7 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-7">
      <p className="text-sm font-bold text-slate-500">{number}</p>

      <h3 className="mt-5 text-xl font-semibold">{title}</h3>

      <p className="mt-3 leading-7 text-slate-400">
        {description}
      </p>
    </div>
  );
}