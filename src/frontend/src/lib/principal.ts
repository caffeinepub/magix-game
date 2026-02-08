import { Principal } from '@icp-sdk/core/principal';

export function parsePrincipal(principalStr: string): Principal {
  try {
    return Principal.fromText(principalStr);
  } catch (error) {
    throw new Error(`Invalid principal format: ${principalStr}`);
  }
}

export function formatPrincipal(principal: Principal, length: number = 8): string {
  const str = principal.toString();
  if (str.length <= length * 2) return str;
  return `${str.slice(0, length)}...${str.slice(-length)}`;
}
