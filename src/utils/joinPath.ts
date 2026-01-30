export function joinPath(
  parent: string,
  name: string,
  isFolder = false,
): string {
  return isFolder ? `${parent}${name}/` : `${parent}${name}`;
}
