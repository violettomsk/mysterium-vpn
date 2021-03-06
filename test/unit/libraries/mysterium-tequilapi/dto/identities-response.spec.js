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

import { describe, it } from '../../../../helpers/dependencies'
import { expect } from 'chai'
import IdentitiesResponseDTO from '../../../../../src/libraries/mysterium-tequilapi/dto/identities-response'
import IdentityDTO from '../../../../../src/libraries/mysterium-tequilapi/dto/identity'

describe('TequilapiClient DTO', () => {
  describe('IdentitiesResponseDTO', () => {
    it('sets properties', async () => {
      const response = new IdentitiesResponseDTO({
        identities: [
          { id: '0x1000FACE' },
          { id: '0x2000FACE' }
        ]
      })

      expect(response.identities).to.have.lengthOf(2)

      expect(response.identities[0]).to.be.an.instanceOf(IdentityDTO)
      expect(response.identities[0].id).to.equal('0x1000FACE')

      expect(response.identities[1]).to.be.an.instanceOf(IdentityDTO)
      expect(response.identities[1].id).to.equal('0x2000FACE')
    })

    it('sets empty properties', async () => {
      const response = new IdentitiesResponseDTO({})

      expect(response.identities).to.be.undefined
    })

    it('sets wrong properties', async () => {
      const response = new IdentitiesResponseDTO('I am wrong')

      expect(response.identities).to.be.undefined
    })
  })
})
