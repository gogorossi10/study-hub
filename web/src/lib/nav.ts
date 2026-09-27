import {
  BarChart3,
  BookOpen,
  FileSearch,
  FileText,
  Home,
  NotebookPen,
  Search,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  to: string
  label: string
  hint: string
  icon: LucideIcon
  group: 'Hub' | 'Academic' | 'Career'
}

export const NAV: NavItem[] = [
  { to: '/', label: 'Studio Home', hint: 'Overview of every tool', icon: Home, group: 'Hub' },
  { to: '/study-help', label: 'Study Help AI', hint: 'Concept explainer, quizzer & exam solver', icon: Sparkles, group: 'Academic' },
  { to: '/workspace', label: 'Notes & Daily Tasks', hint: 'Notes saver, checkpoint & diary', icon: NotebookPen, group: 'Academic' },
  { to: '/summarizer', label: 'Study Summarizer', hint: 'Turn notes into reviews', icon: BookOpen, group: 'Academic' },
  { to: '/analyzer', label: 'Resume Analyzer', hint: 'Score a resume against a role', icon: FileSearch, group: 'Career' },
  { to: '/builder', label: 'Resume Builder', hint: 'Write and download a Word resume', icon: FileText, group: 'Career' },
  { to: '/dashboard', label: 'Career Dashboard', hint: 'ATS trends and metrics', icon: BarChart3, group: 'Career' },
  { to: '/jobs', label: 'Job Search', hint: 'Open listings across portals', icon: Search, group: 'Career' },
]

export function pageMeta(path: string) {
  return NAV.find((item) => item.to === path) || NAV[0]
}
