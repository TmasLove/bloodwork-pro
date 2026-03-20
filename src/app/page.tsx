"use client";

import { useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Activity,
  Upload,
  Brain,
  UserCheck,
  Shield,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  HeartPulse,
  ChevronRight,
} from "lucide-react";
import { motion, useInView } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Reusable animated section wrapper                                  */
/* ------------------------------------------------------------------ */
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dot-grid pattern for hero background                               */
/* ------------------------------------------------------------------ */
function DotGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage:
          "radial-gradient(circle, var(--muted) 0.8px, transparent 0.8px)",
        backgroundSize: "32px 32px",
        opacity: 0.18,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Home() {
  const howItWorksRef = useRef(null);
  const howInView = useInView(howItWorksRef, { once: true, margin: "-60px" });

  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-60px" });

  const steps = [
    {
      num: "01",
      icon: Upload,
      title: "Upload Your Panel",
      desc: "Drag and drop your blood work results as a PDF or image. We support every major lab format out of the box.",
    },
    {
      num: "02",
      icon: Brain,
      title: "AI Analysis",
      desc: "Our advanced AI engine cross-references your biomarkers against the latest clinical research to build your protocol.",
    },
    {
      num: "03",
      icon: UserCheck,
      title: "Doctor Review",
      desc: "A licensed physician reviews every protocol before it reaches you, ensuring safety and accuracy.",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Doctor Verified",
      desc: "Every protocol is reviewed and approved by a licensed physician before delivery.",
    },
    {
      icon: Brain,
      title: "AI-Powered",
      desc: "State-of-the-art LLM analysis generates comprehensive, evidence-based protocols.",
    },
    {
      icon: Clock,
      title: "Fast Turnaround",
      desc: "Receive your personalized protocol within hours, not days or weeks.",
    },
    {
      icon: Upload,
      title: "Easy Upload",
      desc: "PDF or image — just drag and drop your lab results and we handle the rest.",
    },
    {
      icon: Activity,
      title: "Detailed Protocols",
      desc: "Diet, exercise, supplements, and lifestyle — all tailored to your biomarkers.",
    },
    {
      icon: UserCheck,
      title: "Personalized",
      desc: "No cookie-cutter plans. Every recommendation is unique to your blood work.",
    },
  ];

  /* ---- stagger helpers ---- */
  const stagger = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.15 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] } },
  };

  return (
    <>
      <Navbar />

      <main className="overflow-hidden">
        {/* ============================================================ */}
        {/*  HERO                                                        */}
        {/* ============================================================ */}
        <section className="relative min-h-[92vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
          {/* Floating orbs */}
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />

          {/* Dot grid */}
          <DotGrid />

          <div className="relative z-10 mx-auto max-w-5xl text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full glass-card px-5 py-2.5 text-sm font-medium text-[var(--primary)]"
            >
              <Sparkles className="h-4 w-4" />
              AI-Powered Health Protocols
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl leading-[1.08]"
            >
              Your Blood Work,
              <br />
              <span className="gradient-text">Understood</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl text-[var(--muted)] leading-relaxed"
            >
              Upload your blood work panel and receive a personalized daily
              health protocol — generated by AI and verified by real doctors.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/signup"
                className="gradient-btn rounded-2xl px-10 py-4 text-lg shadow-lg inline-flex items-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="glass-card rounded-2xl px-10 py-4 text-lg font-semibold inline-flex items-center gap-2 hover:border-[var(--primary)] transition-all duration-300"
              >
                <span>Log In</span>
                <ChevronRight className="h-5 w-5 text-[var(--muted)]" />
              </Link>
            </motion.div>

            {/* Social proof strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--muted)]"
            >
              <span className="flex items-center gap-1.5">
                <HeartPulse className="h-4 w-4 text-[var(--primary)]" />
                10,000+ panels analyzed
              </span>
              <span className="hidden sm:inline text-[var(--border)]">|</span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-[var(--accent)]" />
                HIPAA compliant
              </span>
              <span className="hidden sm:inline text-[var(--border)]">|</span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-[var(--accent-2)]" />
                Results in hours
              </span>
            </motion.div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  HOW IT WORKS                                                */}
        {/* ============================================================ */}
        <section className="relative px-4 py-28 sm:px-6 lg:px-8">
          {/* Subtle top divider */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--border), transparent)",
            }}
          />

          <div className="mx-auto max-w-6xl" ref={howItWorksRef}>
            <AnimatedSection className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)] mb-3">
                Simple Process
              </p>
              <h2 className="text-3xl sm:text-5xl font-bold">
                How It <span className="gradient-text">Works</span>
              </h2>
            </AnimatedSection>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate={howInView ? "show" : "hidden"}
              className="grid gap-8 md:grid-cols-3"
            >
              {steps.map(({ num, icon: Icon, title, desc }) => (
                <motion.div
                  key={num}
                  variants={fadeUp}
                  className="glass-card glass-card-hover rounded-2xl p-8 text-center"
                >
                  <span className="gradient-text text-5xl font-black leading-none">
                    {num}
                  </span>
                  <div className="mx-auto mt-6 mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-[var(--muted)] leading-relaxed">
                    {desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  WHY BLOODWORK PRO?                                          */}
        {/* ============================================================ */}
        <section className="relative px-4 py-28 sm:px-6 lg:px-8">
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--border), transparent)",
            }}
          />

          <div className="mx-auto max-w-6xl" ref={featuresRef}>
            <AnimatedSection className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
                Features
              </p>
              <h2 className="text-3xl sm:text-5xl font-bold">
                Why <span className="gradient-text">BloodWork Pro</span>?
              </h2>
            </AnimatedSection>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate={featuresInView ? "show" : "hidden"}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {features.map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  className="glass-card glass-card-hover group rounded-2xl p-7 flex items-start gap-5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] transition-colors duration-300 group-hover:bg-[var(--primary)] group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <p className="mt-1.5 text-sm text-[var(--muted)] leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  CTA BAND                                                    */}
        {/* ============================================================ */}
        <section className="relative px-4 py-24 sm:px-6 lg:px-8">
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--border), transparent)",
            }}
          />

          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl sm:text-5xl font-bold leading-tight">
              Ready to take control of your{" "}
              <span className="gradient-text">health</span>?
            </h2>
            <p className="mt-6 text-lg text-[var(--muted)]">
              Join thousands who have already unlocked personalized, doctor-verified
              health protocols from their blood work.
            </p>
            <div className="mt-10">
              <Link
                href="/signup"
                className="gradient-btn rounded-2xl px-12 py-4 text-lg shadow-lg inline-flex items-center gap-2"
              >
                <span>Start Your Analysis</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </AnimatedSection>
        </section>

        {/* ============================================================ */}
        {/*  FOOTER                                                      */}
        {/* ============================================================ */}
        <footer className="relative px-4 py-10 sm:px-6 lg:px-8">
          {/* Gradient top border */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--primary), var(--accent), var(--accent-2), transparent)",
            }}
          />

          <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[var(--primary)]" />
              <span className="font-semibold text-[var(--foreground)]">
                BloodWork Pro
              </span>
            </div>
            <p>
              AI-powered health protocols verified by doctors.
            </p>
            <p className="text-xs">
              This is a demo application. Always consult your healthcare provider.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
