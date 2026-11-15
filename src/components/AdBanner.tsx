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
    // Removed the background, border, and min-height so it is invisible when empty
    <div className="w-full flex justify-center overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client="ca-pub-1496050599454972" 
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      ></ins>
    </div>
  );
}