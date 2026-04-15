export function rewriteMarkdownAssetPaths(raw: string, markdownPath: string): string {
  const topicRel = getTopicRelativePath(markdownPath);
  return raw.replace(
    /!\[([^\]]*)\]\(([^/][^)]+)\)/g,
    (_, alt, src) => {
      if (src.startsWith(`${topicRel}/`)) return `![${alt}](${src})`;
      return `![${alt}](${topicRel}/${src})`;
    },
  );
}

export function stripMarkdownAssetPaths(raw: string, markdownPath: string): string {
  const topicRel = getTopicRelativePath(markdownPath);
  return raw.replace(
    new RegExp(`!\\[([^\\]]*)\\]\\(${escapeRegex(`${topicRel}/`)}([^)]+)\\)`, "g"),
    "![$1]($2)",
  );
}

function getTopicRelativePath(markdownPath: string): string {
  const normalized = markdownPath.replace(/\\/g, "/");
  const marker = "/markdowns/";
  const markerIndex = normalized.lastIndexOf(marker);
  if (markerIndex >= 0) {
    const dir = normalized.slice(markerIndex + 1, normalized.lastIndexOf("/"));
    return dir;
  }
  return normalized.slice(0, normalized.lastIndexOf("/"));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
