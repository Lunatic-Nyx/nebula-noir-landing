// Ids still in this Graph response. A post with no image stays, so prune
// does not delete a reel that is still in the feed.
export function feedKeepIds(items: { id?: string }[]): string[] {
  return items.flatMap((item) => (item.id ? [item.id] : []))
}

// Nothing stored this run: do not delete the posts already on the site.
export function shouldPruneInstagram(stored: number, keepIds: string[]): boolean {
  return stored > 0 && keepIds.length > 0
}
