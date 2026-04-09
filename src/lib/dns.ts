import dns from 'dns/promises';

/**
 * Checks if the domain of an email address has active MX (Mail Exchange) records.
 * This filters out fully fake domains (like @fakedomain123.xyz).
 */
export async function isEmailDeliverable(email: string): Promise<boolean> {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;
    
    // Attempt to resolve MX records for the domain
    const records = await dns.resolveMx(domain);
    
    // If records exist and the array is not empty, it can receive emails
    return records && records.length > 0;
  } catch (error) {
    // dns.resolveMx throws if domain doesn't exist or has no MX records
    console.warn(`[DNS] MX record lookup failed for domain from: ${email}`);
    return false;
  }
}
