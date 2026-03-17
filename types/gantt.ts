export interface GanttTask {
  name: string
  icon: string     // 2-char label e.g. "Z1"
  bl: number       // baseline % 0-100
  ac: number       // actual % 0-100
  dl: number       // delay days (0 = no delay bar)
}
