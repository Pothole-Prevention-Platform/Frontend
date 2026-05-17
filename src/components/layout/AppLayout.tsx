import { type ElementType, type ReactNode, useState } from 'react'
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Landmark,
  MapPin,
  PencilLine,
  Settings,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'

type NavItem = {
  to: string
  label: string
  icon: ElementType
}

type AssetImageProps = {
  sources: string[]
  alt: string
  className: string
  fallback: ReactNode
}

const navItems: NavItem[] = [
  { to: '/risk-map', label: '위험 예측지도', icon: MapPin },
  { to: '/report', label: '시민 신고', icon: PencilLine },
  { to: '/report/ai-review', label: 'AI 판별', icon: ShieldCheck },
  { to: '/agency', label: '관할기관 안내 · 보상 청구', icon: Landmark },
  { to: '/alerts', label: '실시간 알림', icon: Bell },
  { to: '/admin', label: '관리자 대시보드', icon: Settings },
  { to: '/mypage', label: '마이페이지', icon: UserRound },
]

const bottomNavItems: NavItem[] = [
  { to: '/risk-map', label: '위험 예측지도', icon: MapPin },
  { to: '/report', label: '시민 신고', icon: PencilLine },
  { to: '/report/ai-review', label: 'AI 판별', icon: ShieldCheck },
  { to: '/alerts', label: '실시간 알림', icon: Bell },
  { to: '/mypage', label: '마이페이지', icon: UserRound },
]

function AssetImage({ sources, alt, className, fallback }: AssetImageProps) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const src = sources[sourceIndex]

  if (!src) {
    return <>{fallback}</>
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setSourceIndex((current) => current + 1)}
    />
  )
}

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <NavLink to="/risk-map" className="flex min-w-0 items-center gap-3" aria-label="포트홀 가드 AI 위험 예측지도로 이동">
      <AssetImage
        sources={['/assets/loading/pothole-guard-logo.png', '/assets/loading/pothole-guard-logo-cropped.png']}
        alt="포트홀 가드 AI"
        className={cn('h-auto object-contain', compact ? 'w-[160px]' : 'w-[208px]')}
        fallback={
          <div>
            <p className={cn('font-black text-[#07182F]', compact ? 'text-[20px]' : 'text-[25px]')}>
              포트홀 가드 <span className="text-[#0B6DDE]">AI</span>
            </p>
            {!compact && (
              <p className="mt-1 text-[10px] font-bold text-slate-500">
                AI로 예측하고, 함께 지키는 안전한 도로
              </p>
            )}
          </div>
        }
      />
    </NavLink>
  )
}

function SidebarNavItem({ item, compact = false, mobile = false }: { item: NavItem; compact?: boolean; mobile?: boolean }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      end={item.to === '/report'}
      className={({ isActive }) =>
        cn(
          'group flex items-center rounded-xl font-extrabold transition focus-visible:outline-blue-400',
          mobile
            ? 'min-w-0 flex-col justify-center gap-1 px-1 py-2 text-[11px]'
            : compact
              ? 'gap-2 px-3 py-2 text-[13px]'
              : 'gap-3 px-3 py-3 text-[14px]',
          isActive
            ? 'bg-gradient-to-r from-[#075ED5] to-[#0068E8] text-white shadow-[0_14px_28px_rgba(0,95,220,0.25)]'
            : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={mobile ? 20 : compact ? 18 : 22}
            className={cn('shrink-0', isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-700')}
            fill={item.to === '/risk-map' && isActive ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
          <span className={cn('min-w-0 break-keep leading-tight', !compact && !mobile && 'whitespace-nowrap', mobile && 'text-center')}>{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

function PromoCard() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-5 text-center shadow-[0_18px_45px_rgba(0,96,210,0.07)]">
      <p className="text-[14px] font-black leading-relaxed text-blue-700">
        AI가 도로를 지키고
        <br />
        시민이 함께 안전을 만듭니다.
      </p>
      <AssetImage
        sources={['/assets/auth/signup-security.webp', '/assets/auth/signup-security.png']}
        alt="안전한 도로 서비스를 상징하는 방패 일러스트"
        className="mx-auto mt-4 h-[62px] w-[72px] object-contain"
        fallback={
          <div className="mx-auto mt-4 flex h-[62px] w-[72px] items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <ShieldCheck size={38} aria-hidden="true" />
          </div>
        }
      />
      <button
        type="button"
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-blue-100 bg-white text-[13px] font-black text-blue-700 shadow-sm transition hover:bg-blue-50"
      >
        서비스 소개 보기
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </div>
  )
}

function SidebarFooter() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_16px_40px_rgba(15,40,70,0.05)]">
      <AssetImage
        sources={['/assets/loading/molit-logo.png', '/assets/loading/molit-logo-cropped.png']}
        alt="국토교통부"
        className="h-auto w-[128px] object-contain"
        fallback={<span className="text-[17px] font-black text-slate-700">국토교통부</span>}
      />
      <p className="mt-4 text-[11px] font-medium leading-relaxed text-slate-500">
        © 2024 국토교통부
        <br />
        All rights reserved.
      </p>
    </div>
  )
}

function UserAvatar() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-slate-700 shadow-sm">
      <AssetImage
        sources={['/assets/mypage/profile-avatar.webp', '/assets/mypage/profile-avatar.png']}
        alt="사용자 프로필 이미지"
        className="h-full w-full object-cover"
        fallback={<UserRound size={26} aria-hidden="true" />}
      />
    </div>
  )
}

function AppTopActions() {
  return (
    <div className="absolute right-4 top-5 z-20 hidden items-center gap-5 sm:right-6 lg:flex xl:right-7 xl:top-6">
      <button
        type="button"
        aria-label="읽지 않은 알림 3건"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#07182F] transition hover:bg-blue-50"
      >
        <Bell size={24} aria-hidden="true" />
        <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
          3
        </span>
      </button>

      <Link
        to="/mypage"
        aria-label="마이페이지로 이동"
        className="flex items-center gap-3 rounded-full px-2 py-1 transition hover:bg-blue-50 focus-visible:outline-blue-400"
      >
        <UserAvatar />
        <span className="flex items-center gap-2 text-[14px] font-black tracking-[-0.04em] text-slate-800">
          홍길동
          <ChevronDown size={18} aria-hidden="true" />
        </span>
      </Link>
    </div>
  )
}

function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[268px] flex-col border-r border-slate-200 bg-white px-5 py-7 shadow-[8px_0_30px_rgba(15,40,70,0.04)] xl:flex">
      <BrandLogo />
      <nav className="mt-10 space-y-2" aria-label="서비스 메뉴">
        {navItems.map((item, index) => (
          <SidebarNavItem key={`${item.to}-${index}`} item={item} />
        ))}
      </nav>
      <div className="relative mt-auto space-y-7">
        <PromoCard />
        <SidebarFooter />
        <button
          type="button"
          aria-label="사이드바 접기"
          className="absolute bottom-3 right-1 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-md transition hover:bg-slate-50"
        >
          <ChevronLeft size={20} aria-hidden="true" />
          <ChevronLeft size={20} className="-ml-3" aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}

function MobileHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur xl:hidden">
      <div className="flex items-center justify-between gap-3">
        <BrandLogo compact />
        <Link
          to="/mypage"
          aria-label="마이페이지로 이동"
          className="flex shrink-0 items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[12px] font-black text-blue-700"
        >
          <UserRound size={15} aria-hidden="true" />
          홍길동
        </Link>
      </div>
      <nav className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8" aria-label="빠른 메뉴">
        {navItems.map((item, index) => (
          <SidebarNavItem key={`${item.to}-${index}-compact`} item={item} compact />
        ))}
      </nav>
    </header>
  )
}

function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white px-2 py-2 shadow-[0_-10px_28px_rgba(15,40,70,0.08)] lg:hidden" aria-label="하단 주요 메뉴">
      {bottomNavItems.map((item, index) => (
        <SidebarNavItem key={`${item.to}-${index}-mobile`} item={item} mobile />
      ))}
    </nav>
  )
}

export function AppLayout() {
  const location = useLocation()
  const hasPageLevelUserArea = location.pathname === '/admin'

  return (
    <div className="min-h-svh overflow-x-hidden bg-[#F8FBFF] text-slate-900">
      <DesktopSidebar />
      <MobileHeader />
      <main className="relative min-w-0 px-4 py-5 pb-24 sm:px-6 lg:pb-8 xl:ml-[268px] xl:px-7 xl:py-6">
        {!hasPageLevelUserArea && <AppTopActions />}
        <div className="mx-auto w-full max-w-[1600px]">
          <Outlet />
        </div>
      </main>
      <MobileBottomNav />
    </div>
  )
}
