/**
 * @template T
 * @param {string[]} source
 * @returns {Promise<T[]>}
 */
export async function fetchResources(source) {
  console.log(fetchResources.name, source);

  const resource = [];
  for (const url of source) {
    const urlResponse = await fetch(url);
    if (!urlResponse.ok) {
      console.error(fetchResources.name, url, urlResponse.status, urlResponse.statusText);
      continue;
    }

    try {
      resource.push(await urlResponse.json());
    } catch (error) {
      console.error(fetchResources.name, url, "parse failed", error);
    }
  }

  console.debug(fetchResources.name, resource);
  return resource;
}
