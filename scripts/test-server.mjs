// Playwright needs a foreground process. The Astro CLI can detach in agent environments.
process.env.ASTRO_TELEMETRY_DISABLED = '1';
const { dev } = await import('astro');
const server = await dev({
  server: { host: '127.0.0.1', port: 4321 },
  devToolbar: { enabled: false },
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await server.stop();
    process.exit(0);
  });
}
