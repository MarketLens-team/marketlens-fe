import { createBrowserRouter } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import AdminCrawlingPage from '../pages/AdminCrawlingPage'
import AdminPage from '../pages/AdminPage'
import AdminStocksPage from '../pages/AdminStocksPage'
import BuzzAlertPage from '../pages/BuzzAlertPage'
import DashboardPage from '../pages/DashboardPage'
import DevActionButtonPage from '../pages/DevActionButtonPage'
import DevPageLoadingPage from '../pages/DevPageLoadingPage'
import DevErrorPagePreview from '../pages/DevErrorPagePreview'
import DevErrorPagesPage from '../pages/DevErrorPagesPage'
import DevRefinedMockPage from '../pages/DevRefinedMockPage'
import DevRefinedStylePage from '../pages/DevRefinedStylePage'
import DevLayoutHomePreviewPage from '../pages/DevLayoutHomePreviewPage'
import DevLayoutSplitPage from '../pages/DevLayoutSplitPage'
import DevWatchlistPage from '../pages/DevWatchlistPage'
import DevSidebarCompactPage from '../pages/DevSidebarCompactPage'
import DevSidebarGlassPage from '../pages/DevSidebarGlassPage'
import DevSidebarMinimalPage from '../pages/DevSidebarMinimalPage'
import LoginPage from '../pages/LoginPage'
import MyPage from '../pages/MyPage'
import PersonTrackerPage from '../pages/PersonTrackerPage'
import SectorPage from '../pages/SectorPage'
import StockDetailPage from '../pages/StockDetailPage'
import WatchlistPage from '../pages/WatchlistPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dev',
    element: <DevActionButtonPage />,
  },
  {
    path: '/dev/loading',
    element: <DevPageLoadingPage />,
  },
  {
    path: '/dev/refined',
    element: <DevRefinedStylePage />,
  },
  {
    path: '/dev/refined/mock',
    element: <DevRefinedMockPage />,
  },
  {
    path: '/dev/errors',
    element: <DevErrorPagesPage />,
  },
  {
    path: '/dev/errors/:variant',
    element: <DevErrorPagePreview />,
  },
  {
    path: '/dev/layout-home',
    element: <DevLayoutHomePreviewPage />,
  },
  {
    path: '/dev/layout-split',
    element: <DevLayoutSplitPage />,
  },
  {
    path: '/dev/watchlist',
    element: <DevWatchlistPage />,
  },
  {
    path: '/dev/sidebar-minimal',
    element: <DevSidebarMinimalPage />,
  },
  {
    path: '/dev/sidebar-glass',
    element: <DevSidebarGlassPage />,
  },
  {
    path: '/dev/sidebar-compact',
    element: <DevSidebarCompactPage />,
  },
  {
    element: <PrivateRoute />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/sector', element: <SectorPage /> },
      { path: '/watchlist', element: <WatchlistPage /> },
      { path: '/mypage', element: <MyPage /> },
      { path: '/stock/:stockCode', element: <StockDetailPage /> },
      { path: '/person', element: <PersonTrackerPage /> },
      { path: '/buzz', element: <BuzzAlertPage /> },
    ],
  },
  {
    path: '/admin',
    element: <PrivateRoute requiredRole="ADMIN" />,
    children: [
      { index: true, element: <AdminPage /> },
      { path: 'stocks', element: <AdminStocksPage /> },
      { path: 'crawling', element: <AdminCrawlingPage /> },
    ],
  },
])
