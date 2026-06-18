import { HashRouter, Route, Routes } from 'react-router-dom'

import { CheckInPage, CheckInReportPage } from '~/pages/checkin'
import { CompatibilityPage } from '~/pages/compatibility'
import { NotFoundPage } from '~/pages/error'
import { HomePage } from '~/pages/home'
import { HoroscopePage } from '~/pages/horoscope'
import { ProfilePage } from '~/pages/profile'
import { SalaryPage } from '~/pages/salary'
import { SubscriptionPage } from '~/pages/subscription'
import { ToolsPage } from '~/pages/tools'

import { TabsLayout } from './layouts/TabsLayout'

export const App = () => (
  <HashRouter>
    <Routes>
      <Route element={<TabsLayout />}>
        <Route path='/' element={<HomePage />} />
        <Route path='/tools' element={<ToolsPage />} />
        <Route path='/profile' element={<ProfilePage />} />
      </Route>
      <Route path='/checkin' element={<CheckInPage />} />
      <Route path='/checkin/report' element={<CheckInReportPage />} />
      <Route path='/salary' element={<SalaryPage />} />
      <Route path='/horoscope' element={<HoroscopePage />} />
      <Route path='/compatibility' element={<CompatibilityPage />} />
      <Route path='/premium' element={<SubscriptionPage />} />
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  </HashRouter>
)
