/*
 * Copyright (C) 2017 The "MysteriumNetwork/mysterium-vpn" Authors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// @flow
import Vue from 'vue'
import DIContainer from '../../app/di/vue-container'
import bugReportingConfigBootstrap from '../../dependencies/bug-reporting'
import featureToggleBootstrap from '../../dependencies/feature-toggle'
import bugReportingBootstrap from './modules/bug-reporting'
import eventsBootstrap from '../../dependencies/statistics'
import paymentsBootstrap from '../../dependencies/payments'
import vueBootstrap from './modules/vue'
import applicationBootstrap from './modules/application'
import mysteriumTequilapiBootstrap from '../../dependencies/mysterium-tequilapi'

/**
 * Bootstraps all application dependencies into DI container
 */
function bootstrap (): DIContainer {
  const container = new DIContainer(Vue)

  featureToggleBootstrap(container)
  bugReportingConfigBootstrap(container)
  bugReportingBootstrap(container)
  eventsBootstrap(container)
  paymentsBootstrap(container)
  vueBootstrap(container)
  applicationBootstrap(container)
  mysteriumTequilapiBootstrap(container)

  return container
}

export { bootstrap }
