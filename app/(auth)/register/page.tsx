"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { register as registerVendor } from "../actions";

const STEPS = [
  { fields: ["email", "password"] as const, title: "Create your account", description: "Let's get you set up." },
  { fields: ["companyName", "contactName"] as const, title: "Your company", description: "Tell us who you are." },
  { fields: ["phone", "address"] as const, title: "Contact details", description: "So admins can reach you." },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [submitted, setSubmitted] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => {
      router.push("/vendor/dashboard");
      router.refresh();
    }, 2200);
    return () => clearTimeout(timer);
  }, [submitted, router]);

  async function goNext() {
    const valid = await trigger(STEPS[step].fields);
    if (!valid) return;
    setDirection(1);
    setStep((s) => s + 1);
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => s - 1);
  }

  async function onSubmit(values: RegisterInput) {
    const result = await registerVendor(values);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setCompanyName(values.companyName);
    setDirection(1);
    setSubmitted(true);
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <Card className="w-full max-w-sm overflow-hidden">
      {!submitted && (
        <div className="flex gap-1.5 px-6 pt-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>
      )}

      {submitted ? (
        <CardContent
          key="success"
          className="flex flex-col items-center gap-3 px-6 py-12 text-center animate-in fade-in zoom-in-95 duration-500"
        >
          <CheckCircle2 className="size-14 text-primary animate-in zoom-in duration-500 ease-out" />
          <h2 className="text-xl font-semibold tracking-tight">You&apos;re in, {companyName}</h2>
          <p className="text-sm text-muted-foreground">
            Your account is set up and your application is now pending review. Taking you to your dashboard…
          </p>
        </CardContent>
      ) : (
        <form onSubmit={step === STEPS.length - 1 ? handleSubmit(onSubmit) : (e) => e.preventDefault()}>
          <CardHeader className="pt-5">
            <CardTitle>{STEPS[step].title}</CardTitle>
            <CardDescription>{STEPS[step].description}</CardDescription>
          </CardHeader>

          <CardContent
            key={step}
            className={cn(
              "space-y-4 duration-300",
              direction === 1 ? "animate-in slide-in-from-right-8 fade-in" : "animate-in slide-in-from-left-8 fade-in",
            )}
          >
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" autoComplete="email" {...register("email")} />
                  {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
                  {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company name</Label>
                  <Input id="companyName" {...register("companyName")} />
                  {errors.companyName && <p className="text-sm text-red-600">{errors.companyName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact name</Label>
                  <Input id="contactName" {...register("contactName")} />
                  {errors.contactName && <p className="text-sm text-red-600">{errors.contactName.message}</p>}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register("phone")} />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address (optional)</Label>
                  <Input id="address" {...register("address")} />
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="mt-4 flex-col gap-3">
            <div className="flex w-full gap-2">
              {step > 0 && (
                <Button type="button" variant="outline" size="icon" onClick={goBack} aria-label="Back">
                  <ChevronLeft />
                </Button>
              )}
              {isLastStep ? (
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account…" : "Create account"}
                </Button>
              ) : (
                <Button type="button" className="flex-1" onClick={goNext}>
                  Continue
                </Button>
              )}
            </div>
            {step === 0 && (
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-foreground underline">
                  Sign in
                </Link>
              </p>
            )}
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
