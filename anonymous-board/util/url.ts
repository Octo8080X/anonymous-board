export function matchRootRoutePath(url: URL): boolean {
    const pattern = new URLPattern({
      pathname: "/",
    });
    return pattern.test(url);
  }
  
export function matchAppRoutePath(url: URL): boolean {
  const patternTopic = new URLPattern({
    pathname: "/topic",
  });
  
  const patternTopics = new URLPattern({
    pathname: "/topics/**",
  });

  return patternTopic.test(url) || patternTopics.test(url);
}

