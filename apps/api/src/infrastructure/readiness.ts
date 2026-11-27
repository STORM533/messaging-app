type Probe = () => Promise<boolean>;

function singleFlight(probe: Probe): Probe {
  let active: Promise<boolean> | undefined;

  return () =>
    (active ??= Promise.resolve()
      .then(probe)
      .catch(() => false)
      .finally(() => {
        active = undefined;
      }));
}

export function createReadiness(mongo: Probe, redis: Probe, timeoutMs = 1000) {
  const checkMongo = singleFlight(mongo);
  const checkRedis = singleFlight(redis);

  return async () => {
    let timer: NodeJS.Timeout | undefined;
    const deadline = new Promise<false>((resolve) => {
      timer = setTimeout(resolve, timeoutMs, false);
    });
    try {
      const ready = Promise.all([checkMongo(), checkRedis()]).then(
        ([mongoReady, redisReady]) => mongoReady && redisReady,
      );
      return await Promise.race([ready, deadline]);
    } finally {
      clearTimeout(timer);
    }
  };
}
