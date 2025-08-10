"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function AddEmployeeDialog() {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      const generated = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
      setPassword(generated);
    }
  };
  const generateRandomPassword = () => {
    const generated = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    setPassword(generated);
  }

  const sendOtp = async () => {
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      setOtpSent(true);
    }
  };

  const verifyOtp = async () => {
    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: otp }),
    });
    if (res.ok) {
      setOtpVerified(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" aria-label="Add employee">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register Employee</DialogTitle>
        </DialogHeader>
        <div className=" grid gap-4">
          <div className="grid gap-1">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                aria-describedby="password-help"
                aria-live="polite"
                spellCheck={false}
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={generateRandomPassword}>
                Generate
              </Button>
            </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-password"
              checked={showPassword}
              onCheckedChange={() => { setShowPassword(!showPassword) }}
              aria-controls="password"
              aria-label="Show password"
              className="mt-0.5"
            />
            <Label htmlFor="show-password" className="cursor-pointer text-sm font-medium">
              Show password
            </Label>
          </div>

          </div>
          {!otpSent && (
            <Button className="w-full" onClick={sendOtp}>
              Register &amp; Send email
            </Button>
          )}
          {otpSent && !otpVerified && (
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label>Verification code</Label>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={verifyOtp}>
                Verify OTP
              </Button>
            </div>
          )}
          {otpVerified && <p className="text-sm text-green-600">Verified!</p>}

        </div>

      </DialogContent>
    </Dialog >
  );
}

