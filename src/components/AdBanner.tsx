"use client";

import { useEffect } from "react";

interface AdBannerProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
}

export default function AdBanner({
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
}: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error: any) {
      console.error("AdSense rendering error:", error.message);
    }
  }, []);

  return (
    <div className="w-full flex justify-center my-8 overflow-hidden bg-gray-900/20 border border-white/5 rounded-xl p-2 min-h-[100px]">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // REPLACE WITH YOUR ID ONCE APPROVED
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      ></ins>
    </div>
  );
}