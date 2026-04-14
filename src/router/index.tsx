import { createBrowserRouter } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import AdminCrawlingPage from '../pages/AdminCrawlingPage'
import AdminPage from '../pages/AdminPage'
import AdminStocksPage from '../pages/AdminStocksPage'
import BuzzAlertPage from '../pages/BuzzAlertPage'
import DashboardPage from '../pages/DashboardPage'
import DevActionButtonPage from '../pages/DevActionButtonPage'
import LoginPage from '../pages/LoginPage'
import PersonTrackerPage from '../pages/PersonTrackerPage'
import StockDetailPage from '../pages/StockDetailPage'

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
    element: <PrivateRoute />,
    children: [
      { path: '/', element: <DashboardPage /> },
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
