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

import type { TequilapiClient } from '../../libraries/mysterium-tequilapi/client'
import { FunctionLooper } from '../../libraries/function-looper'
import type { Callback } from '../../libraries/subscriber'
import Subscriber from '../../libraries/subscriber'
import type { RegistrationFetcher } from './registration-fetcher'
import IdentityRegistrationDTO from '../../libraries/mysterium-tequilapi/dto/identity-registration'

class TequilapiRegistrationFetcher implements RegistrationFetcher {
  _api: TequilapiClient
  _loop: FunctionLooper
  _registrationSubscriber: Subscriber<IdentityRegistrationDTO> = new Subscriber()
  _errorSubscriber: Subscriber<Error> = new Subscriber()
  _identityId: string

  constructor (api: TequilapiClient, interval: number = 5000) {
    this._api = api

    this._loop = new FunctionLooper(async () => {
      await this.fetch()
    }, interval)
    this._loop.onFunctionError((error) => {
      this._errorSubscriber.notify(error)
    })
  }

  /**
   * Starts periodic proposal fetching.
   */
  start (identityId: string): void {
    this._identityId = identityId
    if (!this._loop.isRunning()) {
      this._loop.start()
    }
  }

  /**
   * Forces proposals to be fetched without delaying.
   */
  async fetch (): Promise<IdentityRegistrationDTO> {
    const registration = await this._api.identityRegistration(this._identityId)

    this._registrationSubscriber.notify(registration)

    return registration
  }

  async stop (): Promise<void> {
    await this._loop.stop()
  }

  onFetchedRegistration (subscriber: Callback<IdentityRegistrationDTO>): void {
    this._registrationSubscriber.subscribe(subscriber)
  }

  onFetchingError (subscriber: Callback<Error>): void {
    this._errorSubscriber.subscribe(subscriber)
  }
}

export default TequilapiRegistrationFetcher
