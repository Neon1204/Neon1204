import { mkdir, readFile, writeFile } from "node:fs/promises";

const data = JSON.parse(await readFile("profile-data.json", "utf8"));
await mkdir("output", { recursive: true });

const escapeXml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[char]);

const days = data.days.slice(-31);
const width = 900;
const height = 260;
const plot = { left: 48, top: 38, width: 814, height: 155 };
const max = Math.max(1, ...days.map((day) => day.count));
const points = days.map((day, index) => ({
  ...day,
  x: plot.left + (index * plot.width) / Math.max(1, days.length - 1),
  y: plot.top + plot.height - (day.count / max) * plot.height,
}));
const line = points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
const area = `${plot.left},${plot.top + plot.height} ${line} ${plot.left + plot.width},${plot.top + plot.height}`;
const dots = points
  .filter((_, index) => index % 3 === 0 || index === points.length - 1)
  .map((point) => `<circle cx="${point.x}" cy="${point.y}" r="3.5"><title>${escapeXml(point.date)}: ${point.count} contributions</title></circle>`)
  .join("");
const labels = points
  .filter((_, index) => index % 5 === 0 || index === points.length - 1)
  .map((point) => `<text x="${point.x}" y="224" text-anchor="middle">${escapeXml(point.date.slice(5))}</text>`)
  .join("");

const activity = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="260" viewBox="0 0 900 260" role="img" aria-label="GitHub activity for the last 31 days">
<defs><linearGradient id="line" x1="0" x2="1"><stop stop-color="#54d6e8"/><stop offset="1" stop-color="#8465e8"/></linearGradient><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#6f83ea" stop-opacity=".32"/><stop offset="1" stop-color="#6f83ea" stop-opacity="0"/></linearGradient><style>text{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;fill:#64748b;font-size:12px}.title{font-size:18px;font-weight:700;fill:#334155}.value{fill:#6d6be5;font-weight:700}</style></defs>
<rect width="900" height="260" rx="16" fill="#fff" stroke="#dbe4ee"/><text class="title" x="36" y="28">Contribution activity</text><text class="value" x="864" y="28" text-anchor="end">${data.totalContributions} this year</text>
<path d="M48 193H862M48 141H862M48 89H862M48 38H862" stroke="#e7edf4"/><polygon points="${area}" fill="url(#area)"/><polyline points="${line}" fill="none" stroke="url(#line)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><g fill="#fff" stroke="#6f83ea" stroke-width="2">${dots}</g>${labels}</svg>`;

const metrics = [
  ["COMMITS", data.totalContributions, "this contribution year"],
  ["STARS", data.totalStars, "across public repositories"],
  ["REPOS", data.publicRepos, "public projects"],
  ["FOLLOWERS", data.followers, "GitHub community"],
  ["PULL REQUESTS", data.pullRequests, "public contributions"],
  ["ISSUES", data.issues, "public contributions"],
];
const cards = metrics.map(([label, value, note], index) => {
  const x = 18 + (index % 3) * 288;
  const y = 54 + Math.floor(index / 3) * 112;
  return `<g transform="translate(${x} ${y})"><rect width="270" height="94" rx="14" fill="#111827" stroke="#334155"/><circle cx="35" cy="35" r="21" fill="none" stroke="url(#ring)" stroke-width="5"/><text class="metric" x="35" y="41" text-anchor="middle">${value}</text><text class="label" x="67" y="31">${label}</text><text class="note" x="67" y="54">${note}</text></g>`;
}).join("");
const trophies = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="286" viewBox="0 0 900 286" role="img" aria-label="GitHub profile highlights"><defs><linearGradient id="ring" x1="0" x2="1"><stop stop-color="#54d6e8"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient><style>text{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}.heading{font-size:19px;font-weight:700;fill:#e5e7eb}.metric{font-size:13px;font-weight:800;fill:#f8fafc}.label{font-size:13px;font-weight:800;fill:#a5b4fc}.note{font-size:11px;fill:#94a3b8}</style></defs><rect width="900" height="286" rx="18" fill="#0f172a"/><text class="heading" x="18" y="32">GitHub highlights · @Neon1204</text>${cards}</svg>`;

await Promise.all([
  writeFile("output/activity-graph.svg", activity),
  writeFile("output/profile-trophies.svg", trophies),
]);
