export function FloatingBlobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute -left-32 -top-32 h-[520px] w-[520px] animate-blob-pulse animate-float opacity-70"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#f0efed"
          d="M44.7,-58.3C57.3,-49.2,66.6,-34.5,69.9,-18.7C73.2,-2.9,70.4,14,62.4,28.1C54.3,42.2,40.9,53.5,25.5,60.4C10.1,67.3,-7.3,69.8,-23.7,65.1C-40.1,60.4,-55.6,48.5,-63.9,33C-72.2,17.5,-73.3,-1.5,-67.9,-17.8C-62.6,-34.1,-50.8,-47.7,-37,-56.5C-23.2,-65.4,-7.3,-69.5,7.9,-69.1C23.1,-68.7,32.1,-67.4,44.7,-58.3Z"
          transform="translate(100 100)"
        />
      </svg>
      <svg
        className="absolute -bottom-40 -right-32 h-[600px] w-[600px] animate-blob-pulse animate-float-reverse opacity-60"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#eae9e7"
          d="M38.2,-62.3C51.7,-54.8,66,-47.7,72.6,-36C79.2,-24.3,78.1,-8.1,74.1,6.1C70.1,20.4,63.1,32.8,53.6,43.8C44.1,54.9,32.1,64.6,18.2,69.5C4.3,74.4,-11.5,74.5,-25.6,69.2C-39.6,63.9,-52,53.2,-60.7,40C-69.4,26.8,-74.3,11.1,-73.1,-3.9C-71.9,-18.9,-64.5,-33.2,-54.2,-42.2C-43.8,-51.2,-30.6,-54.9,-18,-60.5C-5.5,-66.1,6.5,-73.6,18.9,-73.6C31.3,-73.5,44.1,-66,38.2,-62.3Z"
          transform="translate(100 100)"
        />
      </svg>
    </div>
  );
}

export function WaveDivider({ flip = false, fill = "#ffffff" }: { flip?: boolean; fill?: string }) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className={"block h-20 w-full " + (flip ? "rotate-180" : "")}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={fill}
        d="M0,80 C240,0 480,80 720,40 C960,0 1200,80 1440,40 L1440,80 L0,80 Z"
      />
    </svg>
  );
}
