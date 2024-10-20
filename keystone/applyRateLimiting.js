import { RateLimiterMemory } from "rate-limiter-flexible";

const defaultRateLimitConfig = {
  points: 50, // Maximum number of failed attempts
  duration: 900, // Per 15 minutes
  blockDuration: 900 // Block for 15 minutes after exceeding points
};

const customRateLimits = {
  createUser: { points: 5, duration: 900, blockDuration: 600 }, // More strict for user creation
  createCart: { points: 10, duration: 900, blockDuration: 300 }, // Less strict for cart creation
};

// List of operations that should be rate-limited
const rateLimitedOperations = {
  Query: [
    "products",
    "productCollections",
    "productCategories",
    "productOptions",
    "productOptionValues",
    "productVariants",
    "currencies",
    "regions",
    "shippingOptions",
    "stores",
    "countries",
    "moneyAmounts",
  ],
  Mutation: ["createCart", "createUser", "authenticateUserWithPassword"],
};

// Function to create a rate limiter with a given configuration
const createRateLimiter = (config) => new RateLimiterMemory(config);

// Create rate limiters for default and custom configurations
const rateLimiters = {
  default: createRateLimiter(defaultRateLimitConfig),
  ...Object.fromEntries(
    Object.entries(customRateLimits).map(([key, config]) => [
      key,
      createRateLimiter(config),
    ])
  ),
};

// Apply rate limiting to a specific operation
const applyRateLimit = async (context, operation) => {
  const ip = context.req.ip;
  const rateLimiter = rateLimiters[operation] || rateLimiters.default;

  try {
    const rateLimitResult = await rateLimiter.consume(ip);

    // Set headers for rate limit information
    context.res.setHeader("X-RateLimit-Limit", rateLimiter.points);
    context.res.setHeader(
      "X-RateLimit-Remaining",
      rateLimitResult.remainingPoints
    );
    context.res.setHeader(
      "X-RateLimit-Reset",
      new Date(Date.now() + rateLimitResult.msBeforeNext).toUTCString()
    );
  } catch (err) {
    const retryAfter = Math.ceil(err.msBeforeNext / 1000) || 60;
    context.res.setHeader("Retry-After", String(retryAfter));
    context.res.setHeader("X-RateLimit-Limit", rateLimiter.points);
    context.res.setHeader("X-RateLimit-Remaining", 0);
    context.res.setHeader(
      "X-RateLimit-Reset",
      new Date(Date.now() + err.msBeforeNext).toUTCString()
    );
    throw new Error(
      `Too many requests. Please try again in ${retryAfter} seconds.`
    );
  }
};

// Create the applyRateLimiting object
const applyRateLimiting = {
  Query: {},
  Mutation: {},
};

// Apply rate limiting to Query operations
rateLimitedOperations.Query.forEach((operation) => {
  applyRateLimiting.Query[operation] = async (
    resolve,
    root,
    args,
    context,
    info
  ) => {
    await applyRateLimit(context, operation);
    return resolve(root, args, context, info);
  };
});

// Apply rate limiting to Mutation operations
rateLimitedOperations.Mutation.forEach((operation) => {
  applyRateLimiting.Mutation[operation] = async (
    resolve,
    root,
    args,
    context,
    info
  ) => {
    await applyRateLimit(context, operation);
    return resolve(root, args, context, info);
  };
});

export { applyRateLimiting };
