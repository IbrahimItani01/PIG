import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { brand } from "@/config/brand";
import { marketingNavigation } from "@/config/navigation";
import { rubricConfig } from "@/config/rubric";
import { siteContent } from "@/config/site-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingMotion } from "@/components/marketing/landing-motion";

export default function MarketingPage() {
  return (
    <main className="grid-bg min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold">{brand.shortName}</Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {marketingNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <Button asChild size="sm">
          <Link href="/login">Log in</Link>
        </Button>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
        <LandingMotion>
          <Badge className="mb-5" variant="secondary">{brand.tagline}</Badge>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-normal text-foreground sm:text-6xl">{siteContent.hero.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{siteContent.hero.body}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">{siteContent.hero.primaryCta}<ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/#features">{siteContent.hero.secondaryCta}</Link>
            </Button>
          </div>
        </LandingMotion>
        <LandingMotion delay={0.12}>
          <Card className="bg-card/90">
            <CardHeader>
              <CardTitle>Prompt score preview</CardTitle>
              <CardDescription>Rubric-backed quality signal before you run the prompt.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(rubricConfig).slice(0, 5).map(([key, item], index) => (
                <div key={key}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="font-mono text-muted-foreground">{8 - (index % 3)}/10</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${(8 - (index % 3)) * 10}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </LandingMotion>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {siteContent.explanation.map((item) => (
            <Card key={item}>
              <CardContent className="pt-5 text-sm text-muted-foreground">{item}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="example" className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8">
        <Card>
          <CardHeader><CardTitle>Before</CardTitle></CardHeader>
          <CardContent className="text-muted-foreground">{siteContent.beforeAfter.before}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>After</CardTitle></CardHeader>
          <CardContent className="text-muted-foreground">{siteContent.beforeAfter.after}</CardContent>
        </Card>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {siteContent.features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{feature.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {siteContent.pricing.map((plan) => (
            <Card key={plan.name}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription className="space-y-2">
                  <span className="block"><span className="text-3xl font-semibold text-foreground">{plan.price}</span> / month</span>
                  <span className="block">{plan.description}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
                <Button className="w-full" variant={plan.name === "Pro" ? "default" : "outline"}>{plan.cta}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-3">
          {siteContent.faq.map((item) => (
            <Card key={item.question}>
              <CardHeader>
                <CardTitle>{item.question}</CardTitle>
                <CardDescription>{item.answer}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <span>{brand.fullName}</span>
        <div className="flex gap-4">
          {siteContent.footerLinks.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </div>
      </footer>
    </main>
  );
}
