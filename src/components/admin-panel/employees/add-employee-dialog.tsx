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
import { useRouter } from "next/navigation";
import { fetchPendingEmployees } from "@/utils/api";


export function AddEmployeeDialog({ onPendingRefresh }: { onPendingRefresh?: (pending: any[]) => void }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const reset = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setOtpSent(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      const generated = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
      setPassword(generated);
    } else {
      reset();
    }
  };

  const sendOtp = async () => {
    if (!email || !username) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if (!res.ok) throw new Error("Failed");
      setOtpSent(true);
      if (onPendingRefresh) {
        try {
          const pending = await fetchPendingEmployees();
            onPendingRefresh(pending);
        } catch {
          /* ignore */
        }
      }
    } catch {
      // TODO: surface error UI
    } finally {
      setSubmitting(false);
    }
  };

  const renderForm = () => (
    <div className="grid gap-4">
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
        <Label>Full Name</Label>
        <Input
          type="text"
          placeholder="Full Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <Button type="button" onClick={sendOtp} disabled={submitting}>
        {submitting ? "Adding..." : "Add Employee"}
      </Button>
    </div>
  );

  const renderSuccess = () => (
    <div className="p-4">
        <h2 className="text-lg font-semibold">Employee Registered Successfully!</h2>
        <p className="text-sm text-gray-600">You can now log in with the provided credentials.</p>
      </div>
  );

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
        {otpSent ? renderSuccess() : renderForm()}
      </DialogContent>
    </Dialog>
  );
}

