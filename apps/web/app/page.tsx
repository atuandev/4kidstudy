import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  // Server Component: rendered once per request/build, so reading the clock is fine.
  // oxlint-disable-next-line react/purity
  const year = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/mascot.svg" alt="4KisStudy logo" width={24} height={24} />
            <span className="font-semibold tracking-tight">4KisStudy</span>
          </Link>
          <nav className="hidden gap-6 text-sm font-medium sm:flex">
            <Link href="#features" className="hover:underline underline-offset-4">Features</Link>
            <Link href="#method" className="hover:underline underline-offset-4">Method</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant='secondary'>
              <Link href="/login" >Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto grid gap-8 px-4 py-16 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              English for Vietnamese Kids
            </h1>
            <p className="mt-4 text-muted-foreground">
              4KisStudy helps Vietnamese children learn English with interactive lessons,
              playful games, and daily micro-practice designed for ages 5-11.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant='secondary'>
                <Link href="/login">Start learning now</Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto aspect-video w-full max-w-xl overflow-hidden rounded-xl border bg-muted/20">
            <Image
              src="/hero.svg"
              alt="4KisStudy preview"
              fill
              className="object-contain p-8 dark:invert"
              priority
            />
          </div>
        </section>

        <section id="features" className="border-t bg-muted/20">
          <div className="container mx-auto grid gap-8 px-4 py-16 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              iconSrc="/learn.svg"
              title="Native Pronunciation"
              description="Listen-and-repeat with instant feedback to build confident speaking."
            />
            <FeatureCard
              iconSrc="/practice.svg"
              title="Smart Vocabulary"
              description="Spaced repetition ensures words stick with short daily sessions."
            />
            <FeatureCard
              iconSrc="/leaderboard.svg"
              title="Bite-size Lessons"
              description="10-minute lessons tailored for Vietnamese learners aged 4–12."
            />
          </div>
        </section>

        <section id="method" className="container mx-auto grid gap-8 px-4 py-16 md:grid-cols-2 md:items-center">
          <div className="relative mx-auto aspect-video w-full max-w-xl overflow-hidden rounded-xl border bg-background">
            <Image src="/mascot.svg" alt="Method illustration" fill className="object-contain p-8" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Method that works</h2>
            <p className="mt-4 text-muted-foreground">
              We combine phonics, listening, and playful quizzes. Parents get weekly reports in Vietnamese,
              while kids enjoy rewards that keep motivation high.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />Phonics-first approach</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />Adaptive difficulty</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />Parent-friendly insights</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">© {year} 4KisStudy. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="#privacy" className="hover:underline">Privacy</Link>
            <Link href="#terms" className="hover:underline">Terms</Link>
            <Link href="#contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  iconSrc: string;
  title: string;
  description: string;
}

function FeatureCard({ iconSrc, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border bg-background p-6">
      <div className="flex items-center gap-3">
        <Image src={iconSrc} alt="Feature icon" width={20} height={20} />
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
