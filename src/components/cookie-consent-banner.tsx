"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Cookie, Settings } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = "managemate-cookie-consent";
const COOKIE_PREFERENCES_KEY = "managemate-cookie-preferences";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsent) {
      setIsVisible(true);
    }

    // Load saved preferences
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const acceptAll = () => {
    const allPreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(allPreferences);
  };

  const acceptEssential = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    saveConsent(essentialOnly);
  };

  const saveCustomPreferences = () => {
    saveConsent(preferences);
    setShowSettings(false);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setIsVisible(false);

    // Trigger analytics setup based on preferences
    if (prefs.analytics) {
      // Initialize analytics here if needed
      console.log("Analytics enabled");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-4xl border-2 shadow-lg bg-white dark:bg-gray-900">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Cookie className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Cookie Preferences</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                We use essential cookies to ensure our website works properly for you. {"We'd"} also like to set
                optional analytics cookies to help us improve our service. You can choose which cookies to accept.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                By continuing to use ManageMate, you agree to our use of essential cookies. 
                Read our{" "}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 underline">
                  Privacy Policy
                </Link>{" "}
                for more information.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t">
            <Button onClick={acceptEssential} variant="outline" className="flex-1">
              Accept Essential Only
            </Button>
            
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Customize
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Cookie Preferences</DialogTitle>
                  <DialogDescription>
                    Choose which types of cookies {"you'd"} like to allow.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="essential">Essential Cookies</Label>
                      <p className="text-xs text-gray-500">
                        Required for authentication and core functionality
                      </p>
                    </div>
                    <Switch
                      id="essential"
                      checked={preferences.essential}
                      disabled
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="analytics">Analytics Cookies</Label>
                      <p className="text-xs text-gray-500">
                        Help us understand how you use our service
                      </p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={preferences.analytics}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, analytics: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="marketing">Marketing Cookies</Label>
                      <p className="text-xs text-gray-500">
                        Used for personalized content and ads
                      </p>
                    </div>
                    <Switch
                      id="marketing"
                      checked={preferences.marketing}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, marketing: checked })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button onClick={saveCustomPreferences} className="flex-1">
                    Save Preferences
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button onClick={acceptAll} className="flex-1">
              Accept All Cookies
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}