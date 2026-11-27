import type { CatalogEntry } from './types.ts';

export const catalog: readonly CatalogEntry[] = [
  { id: 'github', name: 'GitHub', baseUrl: 'https://www.githubstatus.com' },
  { id: 'npm', name: 'npm', baseUrl: 'https://status.npmjs.org' },
  { id: 'cloudflare', name: 'Cloudflare', baseUrl: 'https://www.cloudflarestatus.com' },
  { id: 'vercel', name: 'Vercel', baseUrl: 'https://www.vercel-status.com' },
  { id: 'netlify', name: 'Netlify', baseUrl: 'https://www.netlifystatus.com' },
  { id: 'digitalocean', name: 'DigitalOcean', baseUrl: 'https://status.digitalocean.com' },
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://status.openai.com' },
  { id: 'claude', name: 'Claude', baseUrl: 'https://status.claude.com' },
  { id: 'sentry', name: 'Sentry', baseUrl: 'https://status.sentry.io' },
  { id: 'linear', name: 'Linear', baseUrl: 'https://linearstatus.com' },
  { id: 'figma', name: 'Figma', baseUrl: 'https://status.figma.com' },
  { id: 'discord', name: 'Discord', baseUrl: 'https://discordstatus.com' },
  { id: 'twilio', name: 'Twilio', baseUrl: 'https://status.twilio.com' },
  { id: 'dropbox', name: 'Dropbox', baseUrl: 'https://status.dropbox.com' },
];

export const findCatalogEntry = (id: string): CatalogEntry | undefined =>
  catalog.find(({ id: entryId }) => entryId === id);
