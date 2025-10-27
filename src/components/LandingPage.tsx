import Link from "next/link";
import { PanelsTopLeft, Calendar, Users, Smartphone } from "lucide-react";
import { ArrowRightIcon, GitHubLogoIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="z-[50] sticky top-0 w-full bg-background/95 border-b backdrop-blur-sm dark:bg-black/[0.6] border-border/40">
        <div className="container h-14 flex items-center">
          <Link
            href="/"
            className="flex justify-start items-center hover:opacity-85 transition-opacity duration-300"
          >
            <PanelsTopLeft className="w-6 h-6 mr-3" />
            <span className="font-bold">ManageMate</span>
            <span className="sr-only">ManageMate</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 text-sm font-medium">
            <Link href="#features" className="hover:underline">
              Features
            </Link>
            <Link href="#pricing" className="hover:underline">
              Pricing
            </Link>
            <Link href="#contact" className="hover:underline">
              Contact
            </Link>
            <ModeToggle />
          </nav>
        </div>
      </header>
      <main className="min-h-[calc(100vh-57px-97px)] flex-1">
        <div className="container relative pb-10">
          <section className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-6">
            <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
             {`The ManageMate you've always wondered about`}
            </h1>
            <span className="max-w-[750px] text-center text-lg font-light text-foreground">
              A stunning and functional web scheduler complete with desktop and mobile responsiveness.
            </span>
            <div className="flex w-full items-center justify-center space-x-4 py-4 md:pb-6">
              <Button variant="default" asChild>
                <Link href="/dashboard">
                  Login
                  <ArrowRightIcon className="ml-2" />
                </Link>
              </Button>
            </div>
          </section>
          <section
            id="features"
            className="mx-auto mt-12 max-w-[980px] py-12 md:py-24"
          >
            <h2 className="text-center text-3xl font-bold mb-8">Features</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-2">
                <Calendar className="h-10 w-10" />
                <h3 className="text-xl font-semibold">Smart Scheduling</h3>
                <p className="text-muted-foreground">
                  Plan tasks and events with an intuitive calendar that keeps
                  everything organized.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <Users className="h-10 w-10" />
                <h3 className="text-xl font-semibold">Team Collaboration</h3>
                <p className="text-muted-foreground">
                  Share schedules and coordinate with teammates in real time.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <Smartphone className="h-10 w-10" />
                <h3 className="text-xl font-semibold">Access Anywhere</h3>
                <p className="text-muted-foreground">
                  Manage your agenda on desktop or mobile with full
                  responsiveness.
                </p>
              </div>
            </div>
          </section>
          <section
            id="pricing"
            className="mx-auto max-w-[980px] py-12 md:py-24"
          >
            <h2 className="text-center text-3xl font-bold mb-8">Pricing</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="border rounded-lg p-6 text-center space-y-4">
                <h3 className="text-xl font-semibold">Free</h3>
                <p className="text-muted-foreground">
                  Basic scheduling features for individuals.
                </p>
                <div className="text-4xl font-bold">$0</div>
                <Button>Get started</Button>
              </div>
              <div className="border rounded-lg p-6 text-center space-y-4">
                <h3 className="text-xl font-semibold">Pro</h3>
                <p className="text-muted-foreground">
                  Advanced tools for power users and teams.
                </p>
                <div className="text-4xl font-bold">$9/mo</div>
                <Button variant="outline">Contact sales</Button>
              </div>
            </div>
          </section>
          <section
            id="contact"
            className="mx-auto max-w-[980px] py-12 md:py-24 flex flex-col items-center"
          >
            <h2 className="text-center text-3xl font-bold mb-4">Get in touch</h2>
            <p className="text-center text-muted-foreground mb-4">
              Schedule a free 10-minutes call with us
            </p>
            <Button  disabled>Unavailable At The Moment</Button>
          </section>
        </div>
      </main>
      <footer className="py-6 md:py-0 border-t border-border/40">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ManageMate. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/data-request" className="hover:underline">
              Your Data Rights
            </Link>
            <Link
              href="https://github.com/PrimeCodeWhisperer/managemate"
              className="flex items-center gap-1 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubLogoIcon /> GitHub
            </Link>
            <Link href="#contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}