export const DEMO_URLS = [1, 2, 3, 4, 5].map((i) => `/demo/tryon/${i}.svg`);

export async function mockGenerateTryOn(): Promise<string[]> {
  return DEMO_URLS.slice();
}

// Tiny smoke "test" helper (can be executed via ts-node if desired)
export async function __smoke_test__() {
  const urls = await mockGenerateTryOn();
  if (!Array.isArray(urls) || urls.length !== 5) {
    throw new Error("mockGenerateTryOn failed");
  }
  if (!urls.every((u) => typeof u === "string" && u.includes("/demo/tryon/"))) {
    throw new Error("mockGenerateTryOn invalid url format");
  }
  return true;
}