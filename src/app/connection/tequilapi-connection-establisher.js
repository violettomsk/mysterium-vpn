/*
 * Copyright (C) 2018 The "MysteriumNetwork/mysterium-vpn" Authors.
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

import type { EventSender } from '../statistics/event-sender'
import type { BugReporter } from '../bug-reporting/interface'
import type { TequilapiClient } from '../../libraries/mysterium-tequilapi/client'
import { ConnectEventTracker, currentUserTime } from '../statistics/events-connection'
import ConnectionStatusEnum from '../../libraries/mysterium-tequilapi/dto/connection-status-enum'
import TequilapiError from '../../libraries/mysterium-tequilapi/tequilapi-error'
import messages from '../messages'
import logger from '../logger'
import type { ConnectionEstablisher } from './connection-establisher'
import ConnectionRequestDTO from '../../libraries/mysterium-tequilapi/dto/connection-request'
import { FunctionLooper } from '../../libraries/function-looper'
import type { ErrorMessage } from './error-message'
import ConsumerLocationDTO from '../../libraries/mysterium-tequilapi/dto/consumer-location'
import type { ConnectionState } from './connection-state'
import type { ConnectionStatsFetcher } from './connection-stats-fetcher'
import type { ConnectDetails } from '../statistics/events-connection'
import type { Provider } from './provider'

/**
 * Allows connecting and disconnecting to provider using Tequilapi.
 */
class TequilapiConnectionEstablisher implements ConnectionEstablisher {
  _tequilapi: TequilapiClient
  _eventSender: EventSender
  _bugReporter: BugReporter

  constructor (tequilapi: TequilapiClient, eventSender: EventSender, bugReporter: BugReporter) {
    this._tequilapi = tequilapi
    this._eventSender = eventSender
    this._bugReporter = bugReporter
  }

  async connect (
    consumerId: string,
    provider: Provider,
    connectionState: ConnectionState,
    errorMessage: ErrorMessage,
    location: ?ConsumerLocationDTO,
    actionLooper: ?FunctionLooper) {
    const eventTracker = new ConnectEventTracker(this._eventSender, currentUserTime)
    const connectDetails: ConnectDetails = {
      consumerId,
      providerId: provider.id
    }
    const originalCountry = this._getOriginalCountry(location) || ''
    eventTracker.connectStarted(connectDetails, originalCountry, provider.country || '')
    if (actionLooper) {
      await actionLooper.stop()
    }
    await connectionState.setConnectionStatus(ConnectionStatusEnum.CONNECTING)
    connectionState.resetStatistics()
    connectionState.setLastConnectionProvider(provider.id)
    try {
      const request: ConnectionRequestDTO = new ConnectionRequestDTO(consumerId, provider.id, provider.country)
      await this._tequilapi.connectionCreate(request)
      eventTracker.connectEnded()
      errorMessage.hide()
    } catch (err) {
      if (err instanceof TequilapiError && err.isRequestClosedError) {
        eventTracker.connectCanceled()
        return
      }

      errorMessage.showMessage(messages.connectFailed)

      eventTracker.connectEnded('Error: Connection to node failed.')

      this._bugReporter.captureInfoException(err)
    } finally {
      if (actionLooper) {
        actionLooper.start()
      }
    }
  }

  async disconnect (
    connectionState: ConnectionState,
    connectionStatsFetcher: ConnectionStatsFetcher,
    errorMessage: ErrorMessage,
    actionLoopers: ?FunctionLooper) {
    if (actionLoopers) {
      await actionLoopers.stop()
    }

    try {
      await connectionState.setConnectionStatus(ConnectionStatusEnum.DISCONNECTING)

      try {
        await this._tequilapi.connectionCancel()
      } catch (err) {
        errorMessage.showError(err)
        logger.info('Connection cancelling failed:', err)
        this._bugReporter.captureInfoException(err)
      }
      connectionStatsFetcher.fetchConnectionStatus()
      connectionStatsFetcher.fetchConnectionIp()
    } catch (err) {
      errorMessage.showError(err)
      throw err
    } finally {
      if (actionLoopers) {
        actionLoopers.start()
      }
    }
  }

  _getOriginalCountry (location: ?ConsumerLocationDTO): ?string {
    if (location == null || location.originalCountry == null) {
      return null
    }
    return location.originalCountry
  }
}

export default TequilapiConnectionEstablisher
