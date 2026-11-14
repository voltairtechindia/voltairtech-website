"use client";

import { useEffect, useState } from "react";
import { SIMULATOR } from "@/lib/drones";
import { trackSimulatorDownload } from "@/lib/gtag-events";

type Os = "windows" | "mac";

function WindowsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M0 2.2 6.5 1.3v6.2H0zM7.3 1.2 16 0v7.5H7.3zM0 8.3h6.5v6.3L0 13.7zM7.3 8.3H16V16l-8.7-1.2z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11.2 0c.1 1-.3 2-.9 2.7-.6.7-1.6 1.3-2.5 1.2-.1-1 .4-2 .9-2.6C9.3.6 10.3.1 11.2 0Zm3 11.6c-.4 1-.7 1.4-1.2 2.3-.8 1.2-1.9 2.1-3 2.1-1.1 0-1.4-.7-2.8-.7-1.5 0-1.8.7-2.9.7-1.2 0-2.1-1.1-2.8-2.2C-.5 10.6-.6 6.9.6 5c.9-1.4 2.2-2.2 3.5-2.2 1.3 0 2.1.7 3.1.7 1 0 1.7-.7 3.1-.7 1.2 0 2.4.6 3.2 1.7-2.8 1.5-2.4 5.6.7 7.1Z"
      />
    </svg>
  );
}

/**
 * Windows and Mac download buttons. Both always show; the one matching the
 * visitor's computer is filled so it reads as the obvious choice. Phones and
 * tablets get a note that the simulator needs a computer.
 */
export function DroneDownload({ dark = false }: { dark?: boolean }) {
  const [os, setOs] = useState<Os | "mobile" | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/Android|iPhone|iPad|iPod/i.test(ua)) setOs("mobile");
    else if (/Mac/i.test(ua)) setOs("mac");
    else setOs("windows");
  }, []);

  const primary = (which: Os) =>
    os === which || (os !== "mac" && which === "windows") ? "btn btn-primary" : "btn btn-ghost";

  return (
    <div className={"drone-dl" + (dark ? " drone-dl--dark" : "")}>
      <div className="drone-dl__btns">
        <a
          className={primary("windows")}
          href={SIMULATOR.windowsUrl}
          onClick={() => trackSimulatorDownload("windows")}
          rel="nofollow"
        >
          <WindowsIcon /> Download for Windows
        </a>
        <a
          className={primary("mac")}
          href={SIMULATOR.macUrl}
          onClick={() => trackSimulatorDownload("mac")}
          rel="nofollow"
        >
          <AppleIcon /> Download for Mac
        </a>
      </div>
      <p className="drone-dl__meta">
        Trial Version · Windows V{SIMULATOR.windowsVersion} for Windows 10 and 11 ({SIMULATOR.windowsSize}) · Mac
        V{SIMULATOR.macVersion} for Apple M1 or later ({SIMULATOR.macSize})
      </p>
      {os === "mobile" ? (
        <p className="drone-dl__note">
          The simulator runs on a laptop or desktop. Open this page on your computer to download it.
        </p>
      ) : null}
    </div>
  );
}
