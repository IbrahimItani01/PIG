const secretPatterns = [
  /sk-[A-Za-z0-9_-]{20,}/,
  /(?:api|secret|private|access)[_-]?key\s*[:=]\s*["']?[A-Za-z0-9_\-./]{16,}/i,
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /ghp_[A-Za-z0-9]{20,}/,
  /xox[baprs]-[A-Za-z0-9-]{20,}/,
  /AKIA[0-9A-Z]{16}/,
];

export function detectSecrets(input: string) {
  return secretPatterns
    .map((pattern) => pattern.exec(input)?.[0])
    .filter((match): match is string => Boolean(match))
    .map((match) => (match.length > 24 ? `${match.slice(0, 10)}...` : match));
}
