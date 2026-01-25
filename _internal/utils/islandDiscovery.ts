/**
 * Island discovery utilities - extract component names from rendered HTML
 */

/**
 * Parse HTML string and extract unique component names from data-island attributes
 */
export function discoverIslandsInHtml(html: string): Set<string> {
  const regex = /data-island="([^"]+)"/g;
  const componentNames = new Set<string>();
  let match;

  while ((match = regex.exec(html)) !== null) {
    componentNames.add(match[1]);
  }

  return componentNames;
}

/**
 * Combine island discoveries from multiple HTML pages
 */
export function combineIslandDiscoveries(htmlPages: string[]): Map<string, number> {
  const componentCounts = new Map<string, number>();

  for (const html of htmlPages) {
    const islands = discoverIslandsInHtml(html);
    islands.forEach(name => {
      componentCounts.set(name, (componentCounts.get(name) || 0) + 1);
    });
  }

  return componentCounts;
}
