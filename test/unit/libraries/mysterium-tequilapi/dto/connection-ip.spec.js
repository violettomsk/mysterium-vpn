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

import { expect } from 'chai'
import ConnectionIPDTO from '../../../../../src/libraries/mysterium-tequilapi/dto/connection-ip'

describe('TequilapiClient DTO', () => {
  describe('ConnectionIPDTO', () => {
    it('sets properties', async () => {
      const model = new ConnectionIPDTO({ ip: 'mock ip' })

      expect(model.ip).to.equal('mock ip')
    })

    it('sets empty properties', async () => {
      const model = new ConnectionIPDTO({})

      expect(model.ip).to.be.undefined
    })

    it('sets wrong properties', async () => {
      const model = new ConnectionIPDTO('I am wrong')

      expect(model.ip).to.be.undefined
    })
  })
})
