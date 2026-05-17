import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { AgencyCompensationPage } from '../pages/AgencyCompensationPage'
import { AiReviewPage } from '../pages/AiReviewPage'
import { AlertsPage } from '../pages/AlertsPage'
import { AdminDashboardPage } from '../pages/AdminDashboardPage'
import { CitizenReportPage } from '../pages/CitizenReportPage'
import { ComponentPreviewPage } from '../pages/ComponentPreviewPage'
import { InitialSetupPage } from '../pages/InitialSetupPage'
import { LoadingPage } from '../pages/LoadingPage'
import { LoginPage } from '../pages/LoginPage'
import { MyPage } from '../pages/MyPage'
import { RiskMapPage } from '../pages/RiskMapPage'
import { SignupPage } from '../pages/SignupPage'

export const router = createBrowserRouter([
  { path: '/', element: <LoadingPage /> },
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/auth/signup', element: <SignupPage /> },
  {
    element: <AppLayout />,
    children: [
      { path: '/setup', element: <InitialSetupPage /> },
      { path: '/onboarding', element: <InitialSetupPage /> },
      { path: '/risk-map', element: <RiskMapPage /> },
      { path: '/report', element: <CitizenReportPage /> },
      { path: '/report/ai-review', element: <AiReviewPage /> },
      { path: '/agency', element: <AgencyCompensationPage /> },
      { path: '/alerts', element: <AlertsPage /> },
      { path: '/admin', element: <AdminDashboardPage /> },
      { path: '/mypage', element: <MyPage /> },
      { path: '/dev/components', element: <ComponentPreviewPage /> },
    ],
  },
])
