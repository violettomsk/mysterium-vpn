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

import { beforeEach, describe, expect, it } from '../../../../helpers/dependencies'
import RendererEnvironmentCollector
  from '../../../../../src/app/bug-reporting/environment/renderer-environment-collector'
import type { SyncRendererCommunication } from '../../../../../src/app/communication/sync/sync-communication'
import type { SerializedLogCaches } from '../../../../../src/app/logging/log-cache-bundle'
import type { RavenData } from '../../../../../src/app/bug-reporting/bug-reporter-metrics'
import { TAGS } from '../../../../../src/app/bug-reporting/bug-reporter-metrics'

class FakeSyncRendererCommunication implements SyncRendererCommunication {
  mockedSerializedCaches: ?SerializedLogCaches = {
    backend: { info: 'backend info', error: 'backend error' },
    mysterium_process: { info: 'mysterium info', error: 'mysterium error' },
    frontend: { info: 'frontend info', error: 'frontend error' }
  }
  mockedSessionId: ?string = 'mock session id'
  mockedMetrics: RavenData = {
    tags: { [TAGS.CLIENT_RUNNING]: true },
    extra: {}
  }

  getSerializedCaches () {
    return this.mockedSerializedCaches
  }

  getMetrics (): RavenData {
    return this.mockedMetrics
  }

  sendLog (dto) {
  }
}

describe('RendererEnvironmentCollector', () => {
  const releaseID = 'id of release'
  let communication: FakeSyncRendererCommunication
  let collector: RendererEnvironmentCollector

  beforeEach(() => {
    communication = new FakeSyncRendererCommunication()
    collector = new RendererEnvironmentCollector(releaseID, communication)
  })

  describe('.getReleaseId', () => {
    it('returns release id', () => {
      expect(collector.getReleaseId()).to.eql(releaseID)
    })
  })

  describe('.getSerializedCaches', () => {
    it('returns logs using sync communication', () => {
      expect(collector.getSerializedCaches()).to.eql(communication.mockedSerializedCaches)
    })

    it('returns empty logs when communication returns null logs', () => {
      communication.mockedSerializedCaches = null

      expect(collector.getSerializedCaches()).to.eql({
        backend: { info: '', error: '' },
        frontend: { info: '', error: '' },
        mysterium_process: { info: '', error: '' }
      })
    })
  })

  describe('.getMetrics', () => {
    it('returns metrics using sync communication', () => {
      expect(collector.getMetrics()).to.eql(communication.mockedMetrics)
    })
  })
})
