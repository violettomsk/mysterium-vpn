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

import { beforeEach, describe, expect, it } from '../../../../helpers/dependencies'
import ServiceManagerProcess, {SERVICE_STATE} from '../../../../../src/libraries/mysterium-client/service-manager/service-manager-process'
import type {ServiceState} from '../../../../../src/libraries/mysterium-client/service-manager/service-manager-process'
import EmptyTequilapiClientMock from '../../../renderer/store/modules/empty-tequilapi-client-mock'
import SystemMock from '../../../../helpers/system-mock'
import type {NodeHealthcheckDTO} from '../../../../../src/libraries/mysterium-tequilapi/dto/node-healthcheck'
import NodeBuildInfoDTO from '../../../../../src/libraries/mysterium-tequilapi/dto/node-build-info'

const SERVICE_MANAGER_DIR = '/service-manager/bin/'

const getServiceInfo = (state: ServiceState) =>
  `SERVICE_NAME: MysteriumClient
   STATE       : 0  ${state} \r\n`

const createSystemMock = () =>
  new SystemMock(null, new Map([
    ['sc.exe query "MysteriumClient"', getServiceInfo(SERVICE_STATE.RUNNING)],
    ['/service-manager/bin/servicemanager.exe --do=start', getServiceInfo(SERVICE_STATE.START_PENDING)],
    ['/service-manager/bin/servicemanager.exe --do=restart', getServiceInfo(SERVICE_STATE.START_PENDING)]
  ]))

class TequilapiMock extends EmptyTequilapiClientMock {
  cancelIsCalled: boolean = false
  healthCheckThrowsError: boolean = false
  healthCheckIsCalled: boolean = false

  async connectionCancel (): Promise<void> {
    this.cancelIsCalled = true
  }

  async healthCheck (_timeout: ?number): Promise<NodeHealthcheckDTO> {
    this.healthCheckIsCalled = true
    if (this.healthCheckThrowsError) {
      throw new Error('HEALTHCHECK_TEST_ERROR')
    }
    return {
      uptime: '',
      process: 0,
      version: '',
      buildInfo: new NodeBuildInfoDTO({})
    }
  }
}

describe('ServiceManagerProcess', () => {
  let system: SystemMock
  let tequilapiClient: TequilapiMock
  let process: ServiceManagerProcess

  describe('.start()', () => {
    beforeEach(() => {
      tequilapiClient = new TequilapiMock()
      system = createSystemMock()
      process = new ServiceManagerProcess(tequilapiClient, SERVICE_MANAGER_DIR, system)
    })

    it('does nothing with started service at first call', async () => {
      await process.start()
      expect(system.sudoExecCalledCommands).to.have.length(0)
    })

    it('restart started service at second call', async () => {
      // first call does nothing
      await process.start()

      // second call must restart service
      const startPromise = process.start()
      system.execs.set('sc.exe query "MysteriumClient"', getServiceInfo(SERVICE_STATE.RUNNING))
      await startPromise

      expect(system.sudoExecCalledCommands).to.have.length(1)
      expect(system.sudoExecCalledCommands[0]).to.be.eql('/service-manager/bin/servicemanager.exe --do=restart')
    })

    it('starts stopped service', async () => {
      system.execs.set('sc.exe query "MysteriumClient"', getServiceInfo(SERVICE_STATE.STOPPED))

      const startPromise = process.start()
      system.execs.set('sc.exe query "MysteriumClient"', getServiceInfo(SERVICE_STATE.RUNNING))
      await startPromise

      expect(system.sudoExecCalledCommands).to.have.length(1)
      expect(system.sudoExecCalledCommands[0]).to.be.eql('/service-manager/bin/servicemanager.exe --do=start')
    })

    it('starts stopped service once', async () => {
      system.execs.set('sc.exe query "MysteriumClient"', getServiceInfo(SERVICE_STATE.STOPPED))

      const startPromise = process.start()
      system.execs.set('sc.exe query "MysteriumClient"', getServiceInfo(SERVICE_STATE.RUNNING))

      // those calls should be ignored until first "start" call is running
      await process.start()
      await process.start()
      await process.start()
      await process.start()

      // wait until first "start" call ends
      await startPromise

      expect(system.sudoExecCalledCommands).to.have.length(1)
      expect(system.sudoExecCalledCommands[0]).to.be.eql('/service-manager/bin/servicemanager.exe --do=start')
    })

    it('waits for healthcheck after service restart', async () => {
      tequilapiClient.healthCheckThrowsError = true

      system.execs.set('sc.exe query "MysteriumClient"', getServiceInfo(SERVICE_STATE.STOPPED))

      // second call must restart service
      let startExecuted = false
      const startPromise = process.start().then(() => {
        startExecuted = true
      })
      system.execs.set('sc.exe query "MysteriumClient"', getServiceInfo(SERVICE_STATE.RUNNING))

      expect(startExecuted).to.be.false

      tequilapiClient.healthCheckThrowsError = false
      await startPromise

      expect(tequilapiClient.healthCheckIsCalled).to.be.true
      expect(startExecuted).to.be.true
    })
  })

  describe('.stop()', () => {
    beforeEach(() => {
      tequilapiClient = new TequilapiMock()
      system = createSystemMock()
      process = new ServiceManagerProcess(tequilapiClient, SERVICE_MANAGER_DIR, system, 0)
    })

    it('cancels tequilapi connection', async () => {
      await process.stop()
      expect(system.sudoExecCalledCommands).to.have.length(0)
      expect(tequilapiClient.cancelIsCalled).to.be.true
    })
  })
})
