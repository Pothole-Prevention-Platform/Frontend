import {
  Bell,
  Building2,
  Camera,
  Gauge,
  LayoutDashboard,
  Map,
  Sparkles,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '../../utils/cn'

const navItems = [
  { to: '/risk-map', label: '위험 예측지도', icon: Map },
  { to: '/report', label: '시민 신고', icon: Camera },
  { to: '/report/ai-review', label: 'AI 판별', icon: Sparkles },
  { to: '/agency', label: '관할/보상', icon: Building2 },
  { to: '/alerts', label: '위험 알림', icon: Bell },
  { to: '/admin', label: '지자체 대시보드', icon: LayoutDashboard },
]

export function AppLayout() {
  return (
    <div className="min-h-svh bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 xl:block">
        <NavBrand />
        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
      </aside>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur xl:ml-72">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <NavBrand compact />
          <nav className="hidden gap-1 lg:flex xl:hidden">
            {navItems.slice(0, 5).map((item) => (
              <NavItem key={item.to} {...item} compact />
            ))}
          </nav>
          <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Mock Demo
          </div>
        </div>
      </header>
      <main className="px-4 py-6 pb-24 xl:ml-72 xl:px-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white px-2 py-2 shadow-lg lg:hidden">
        {navItems.slice(0, 5).map((item) => (
          <NavItem key={item.to} {...item} mobile />
        ))}
      </nav>
    </div>
  )
}

function NavBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-amber-300">
        <Gauge className="h-5 w-5" />
      </div>
      {!compact && (
        <div>
          <p className="text-sm font-black text-slate-950">POTHOLE AI</p>
          <p className="text-xs font-semibold text-slate-500">공공 안전 예측 플랫폼</p>
        </div>
      )}
    </div>
  )
}

function NavItem({
  to,
  label,
  icon: Icon,
  compact,
  mobile,
}: {
  to: string
  label: string
  icon: React.ElementType
  compact?: boolean
  mobile?: boolean
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg text-sm font-bold transition',
          mobile ? 'justify-center px-1 py-2 text-[11px]' : compact ? 'px-3 py-2' : 'px-4 py-3',
          isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className={cn(mobile && 'sr-only sm:not-sr-only')}>{label}</span>
    </NavLink>
  )
}
