import { RainbowButton } from "@/components/magicui/rainbow-button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-24">
      <h1 className="text-4xl font-bold tracking-tight mb-4">
        University Management System
      </h1>
      <p className="text-muted-foreground mb-8">
        Welcome to the Next.js Client (MagicUI + Tailwind v4)
      </p>
      <div className="flex gap-4">
        <RainbowButton>Get Started</RainbowButton>
        <button className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
          Learn More
        </button>
      </div>
    </div>
  );
}
