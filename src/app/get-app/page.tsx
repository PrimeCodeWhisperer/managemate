"use client";

import { useEffect } from "react";
import Link from "next/link";

const ANDROID_URL = "https://play.google.com/store/apps/details?id=your.app.id";
const IOS_URL = "https://apps.apple.com/app/idXXXXXXXXX";
const APK_FALLBACK = "/downloads/app-latest.apk";

export default function GetAppPage() {
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    let target: string | null = null;
    if (/iphone|ipad|ipod/.test(ua)) target = IOS_URL;
    else if (/android/.test(ua)) target = ANDROID_URL;

    if (target) {
      window.location.replace(target);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center space-y-6">
      <h1 className="text-2xl font-semibold">Download your scheduling app</h1>
      <p className="text-muted-foreground">
        Everything is ready, now download the app to get updates on your schedule!
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href={IOS_URL}
          className="w-full py-2 rounded bg-black text-white text-sm"
          prefetch={false}
        >
          App Store
        </Link>
        <Link
          href={ANDROID_URL}
          className="w-full py-2 rounded bg-green-600 text-white text-sm"
          prefetch={false}
        >
          Google Play
        </Link>
        <Link
          href={APK_FALLBACK}
          className="w-full py-2 rounded border text-sm"
          prefetch={false}
        >
          Direct APK
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">
        After installing, sign in with the same credentials you just created.
      </p>
    </div>
  );
}