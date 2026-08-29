export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    const frontendPort = port || (protocol === 'https:' ? '443' : '80');
    const candidatePorts = ['4000', '3001', '3000', '3002', '3003'];
    const backendPort = candidatePorts.find((candidate) => candidate !== frontendPort) ?? '4000';

    return `${protocol}//${hostname}:${backendPort}`;
  }

  return 'http://localhost:4000';
}
