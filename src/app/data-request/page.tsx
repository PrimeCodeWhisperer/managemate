"use client";

import { useState } from "react";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, CheckCircle } from "lucide-react";
import Link from "next/link";

const requestTypes = [
  { value: "access", label: "Access - Request copies of my personal data" },
  { value: "rectification", label: "Rectification - Correct inaccurate information" },
  { value: "erasure", label: "Erasure - Delete my personal data" },
  { value: "portability", label: "Portability - Receive my data in machine-readable format" },
  { value: "restriction", label: "Restriction - Limit processing of my data" },
  { value: "objection", label: "Objection - Object to processing based on legitimate interests" },
  { value: "withdraw-consent", label: "Withdraw Consent - Stop consent-based processing" },
];

export default function DataRequestPage() {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    requestType: "",
    details: "",
    verificationMethod: "email",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/data-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to submit request. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
              <h2 className="text-2xl font-bold mb-4">Request Submitted Successfully</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Thank you for your data request. We have received your submission and will process it within
                30 days as required by GDPR. You will receive a confirmation email shortly.
              </p>
              <div className="space-x-4">
                <Link href="/">
                  <Button>Return to ManageMate</Button>
                </Link>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Submit Another Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
            ← Back to ManageMate
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <CardTitle className="text-2xl font-bold">GDPR Data Request</CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Exercise your data protection rights under GDPR
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Alert className="mb-6">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                This form allows you to exercise your rights under the General Data Protection Regulation (GDPR).
                All requests are processed within 30 days. For urgent matters, contact us directly at{" "}
                <a href="mailto:privacy@managemate.app" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  privacy@managemate.app
                </a>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestType">Request Type *</Label>
                <Select value={formData.requestType} onValueChange={(value) => setFormData({ ...formData, requestType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the type of request" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Additional Details</Label>
                <Textarea
                  id="details"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Please provide any additional information about your request..."
                  rows={4}
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Identity Verification</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  To protect your privacy, we may need to verify your identity before processing certain requests.
                  We will contact you at the email address provided above with verification instructions if needed.
                </p>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting || !formData.requestType} className="flex-1">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
                <Link href="/privacy">
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    View Privacy Policy
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}