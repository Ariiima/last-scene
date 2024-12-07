import { headers } from 'next/headers';
import redis from './redis';

const DAILY_LIMIT = 10;
const MS_IN_DAY = 24 * 60 * 60 * 1000;

export async function getRateLimitInfo() {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  const now = Date.now();

  // Get current usage from Redis
  const usageData = await redis.get(`rate_limit:${ip}`);
  let usage = usageData ? JSON.parse(usageData) : null;

  // Initialize or reset if day has passed
  if (!usage || now > usage.resetAt) {
    usage = {
      count: 0,
      resetAt: now + MS_IN_DAY,
    };
    await redis.set(`rate_limit:${ip}`, JSON.stringify(usage), 'EX', Math.ceil(MS_IN_DAY / 1000));
  }

  const remainingUses = DAILY_LIMIT - usage.count;
  const hoursUntilReset = Math.ceil((usage.resetAt - now) / (1000 * 60 * 60));

  return {
    remainingUses,
    hoursUntilReset,
    isRateLimited: remainingUses <= 0,
  };
}

export async function incrementRateLimit() {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  
  const usageData = await redis.get(`rate_limit:${ip}`);
  if (usageData) {
    const usage = JSON.parse(usageData);
    usage.count += 1;
    await redis.set(`rate_limit:${ip}`, JSON.stringify(usage), 'EX', Math.ceil((usage.resetAt - Date.now()) / 1000));
  }
}

export async function resetRateLimit() {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  
  const now = Date.now();
  const usage = {
    count: 0,
    resetAt: now + MS_IN_DAY,
  };
  
  await redis.set(`rate_limit:${ip}`, JSON.stringify(usage), 'EX', Math.ceil(MS_IN_DAY / 1000));
} 