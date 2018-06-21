/*
 * Copyright (C) 2017 The "MysteriumNetwork/mysterion" Authors.
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

import type { EnvironmentCollector, LogCaches } from './environment-collector'
import LogCache from '../../logging/log-cache'

class MainEnvironmentCollector implements EnvironmentCollector {
  _backendLogCache: LogCache
  _mysteriumProcessLogCache: LogCache
  _mysterionReleaseId: string
  _sessionId: string

  constructor (backendLogCache: LogCache, mysteriumProcessLogCache: LogCache, mysterionReleaseId: string) {
    this._backendLogCache = backendLogCache
    this._mysteriumProcessLogCache = mysteriumProcessLogCache
    this._mysterionReleaseId = mysterionReleaseId
    this._sessionId = generateSessionId()
  }

  getMysterionReleaseId (): string {
    return this._mysterionReleaseId
  }

  getSessionId (): string {
    return this._sessionId
  }

  getSerializedCaches (): LogCaches {
    return {
      backend: this._backendLogCache.getSerialized(),
      mysterium_process: this._mysteriumProcessLogCache.getSerialized()
    }
  }
}

function generateSessionId () {
  return Math.floor(Math.random() * 10 ** 9).toString()
}

export default MainEnvironmentCollector
