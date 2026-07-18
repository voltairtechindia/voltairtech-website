import Image from "next/image";

export function VMark({ size = 28, bg = "var(--v-ink)" }: { size?: number; bg?: string }) {
  return (
    <span
      className="mark"
      style={{
        width: size,
        height: size,
        borderRadius: 2,
        background: bg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
        padding: size * 0.16,
      }}
      aria-hidden="true"
    >
      <Image
        src="/logo-mark.png"
        alt=""
        width={size}
        height={size}
        style={{ width: "100%", height: "100%", objectFit: "contain", filter: "invert(1) brightness(1.05)" }}
      />
    </span>
  );
}
