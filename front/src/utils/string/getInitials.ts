export function getInitials(name: string): string {
   return name
      .trim()
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase()
}
