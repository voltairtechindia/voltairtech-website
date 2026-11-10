/**
 * Drones section data: the product hub at /drones and the Drone Simulator page.
 *
 * The installers (83 MB and 101 MB) are over Cloudflare Pages' 25 MB file
 * limit, so the buttons download straight from the public GitHub release.
 * `releases/latest/download/<name>` always serves the newest release, so a new
 * version only needs the same two file names attached on GitHub.
 */

const RELEASES = "https://github.com/harshal-aka-mady/Drone_Simulator_V2/releases";

export const SIMULATOR = {
  name: "Voltair Drone Simulator",
  /** Newest version (Windows); the Mac build can lag behind. */
  version: "3.5.0",
  windowsVersion: "3.5",
  macVersion: "3.1.1",
  // Windows follows the latest GitHub release. The Mac link is pinned to the
  // release that holds the V3 Mac build, so a newer release published without
  // a .dmg cannot break it; repoint it when a new Mac build is attached.
  windowsUrl: `${RELEASES}/latest/download/VoltairDroneSimulatorV3-Setup.exe`,
  windowsSize: "84 MB",
  macUrl: `${RELEASES}/download/Drone_trainer_V3/VoltairDroneSimulatorV3-mac.dmg`,
  macSize: "101 MB",
  compliancePdf: "/brochures/DGCA_Compliance_Matrix.pdf",
  img: (name: string) => `/images/drones/simulator/${name}.webp`,
};

export type DroneProduct = {
  slug: string;
  title: string;
  line: string;
  href?: string;
  status: "live" | "soon";
};

export const DRONE_PRODUCTS: DroneProduct[] = [
  {
    slug: "simulator",
    title: "Drone Simulator",
    line: "Practise for the RPTO test on your own computer. Free to download for Windows and Mac.",
    href: "/drones/simulator",
    status: "live",
  },
  {
    slug: "defense",
    title: "Defense Drones",
    line: "Drones built for surveillance and field work by defence and security teams.",
    status: "soon",
  },
  {
    slug: "commercial",
    title: "Commercial Drones (TC)",
    line: "Type certified drones for survey, agriculture and inspection work.",
    status: "soon",
  },
  {
    slug: "training",
    title: "College and Defense Training",
    line: "Drone pilot training programmes run at your college or unit.",
    status: "soon",
  },
  {
    slug: "lab",
    title: "Drone Lab Setup",
    line: "A complete drone lab for your institute: simulators, kits and training.",
    status: "soon",
  },
];

/* ── Advisory: Indian drone companies we advise and work alongside ── */

export type PartnerDrone = {
  slug: string;
  name: string;
  role: string;
  tag: string;
  img: string;
  stats: { label: string; value: string; note: string }[];
  uses: string[];
};

export type AdvisoryPartner = {
  slug: string;
  name: string;
  location: string;
  logo: string;
  url: string;
  about: string;
  drones: PartnerDrone[];
};

/**
 * Only the headline figures from each spec sheet are public here (several
 * sheets are marked confidential); the full details live on the partner's site.
 */
const PREFLIGHT_URL = "https://preflightlabs.in/?utm_source=voltairtech&utm_medium=referral&utm_campaign=advisory";

export const ADVISORY_PARTNERS: AdvisoryPartner[] = [
  {
    slug: "preflight-labs",
    name: "Preflight Labs LLP",
    location: "Goa, India",
    logo: "/images/drones/preflight/logo.webp",
    url: PREFLIGHT_URL,
    about:
      "Preflight Labs designs and builds unmanned systems in India: vertical take-off aircraft for day and night surveillance, a training quadcopter, and a counter-drone interceptor.",
    drones: [
      {
        slug: "talon-1",
        name: "TALON-1",
        role: "Hybrid VTOL UAV",
        tag: "Flagship · Hybrid VTOL",
        img: "/images/drones/preflight/talon.webp",
        stats: [
          { label: "Wingspan", value: "900 mm", note: "VTOL configuration" },
          { label: "All-up weight", value: "1,350 g", note: "takeoff weight" },
          { label: "Battery", value: "4S", note: "16.8 V, 5000 mAh" },
          { label: "Thermal core", value: "640×512", note: "night camera" },
        ],
        uses: [
          "Takes off and lands vertically, no runway needed",
          "Flies waypoint missions on its own",
          "Thermal and day cameras for day and night surveillance",
        ],
      },
      {
        slug: "cobra-vtol",
        name: "COBRA VTOL",
        role: "Long-endurance surveillance UAV",
        tag: "Hybrid VTOL · Surveillance",
        img: "/images/drones/preflight/cobra.webp",
        stats: [
          { label: "Wingspan", value: "2 m", note: "fixed-wing VTOL" },
          { label: "Max takeoff", value: "6 kg", note: "MTOW" },
          { label: "Endurance", value: "1.5 hr", note: "on-station flight" },
          { label: "Payload", value: "500 g", note: "gimbal or sensor" },
        ],
        uses: [
          "Surveillance of borders, coastlines and routes",
          "Search and rescue with thermal imaging, day or night",
          "Inspection of infrastructure and disaster areas",
        ],
      },
      {
        slug: "pfl-trainer",
        name: "PFL TRAINER",
        role: "Training and utility quadcopter",
        tag: "Training · Utility",
        img: "/images/drones/preflight/trainer.webp",
        stats: [
          { label: "Flight time", value: "20+ min", note: "continuous flight" },
          { label: "Camera", value: "1080p", note: "2-axis gimbal" },
          { label: "Payload", value: "500 g", note: "with a dropper" },
          { label: "Power", value: "4S", note: "74 Wh Li-ion" },
        ],
        uses: [
          "Pilot training on an easy, low-risk drone",
          "One-key take-off and return to home",
          "Small deliveries and site inspection",
        ],
      },
      {
        slug: "shrike",
        name: "SHRIKE",
        role: "Net-projectile interceptor",
        tag: "Counter-drone · Non-kinetic",
        img: "/images/drones/preflight/shrike.webp",
        stats: [
          { label: "Platform", value: "X8", note: "eight rotors" },
          { label: "Net", value: "3 × 3 m", note: "capture area" },
          { label: "Range", value: "10 to 15 m", note: "engagement" },
          { label: "Response", value: "Rapid", note: "high-thrust intercept" },
        ],
        uses: [
          "Brings down hostile drones with a net: no rounds fired, no debris",
          "Protects bases, airfields and critical sites",
          "Safe to use near civilians and populated areas",
        ],
      },
    ],
  },
];
