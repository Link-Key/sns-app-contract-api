import has from 'lodash/has'
import { getIERC20Contract } from './contracts'
import { SNS } from './sns'
import {
    getSigner
} from './web3'

const contracts = {
    1: {
        registry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
    },
    3: {
        registry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
    },
    4: {
        registry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
    },
    5: {
        registry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
    },
    137: {
        registry: '0x797301747e21C10356547e27FA8D358e5Bd71bbC'
    },
    80001: {
        registry: '0xAeE4016959945f2461ED2Dc8B71BFE25060EDbdA'
    }
}

export class SNSIERC20 {

    constructor({ networkId, registryAddress, provider }) {
        this.contracts = contracts
        const hasRegistry = has(this.contracts[networkId], 'registry')

        if (!hasRegistry && !registryAddress) {
            throw new Error(`Unsupported network ${networkId}`)
        } else if (this.contracts[networkId] && !registryAddress) {
            registryAddress = contracts[networkId].registry
        }

        this.registryAddress = registryAddress

        const SNSIERC20Contract = getIERC20Contract({ address: registryAddress, provider })
        this.SNSIERC20 = SNSIERC20Contract
    }

    /* Get the raw Ethers contract object */
    getSNSIERC20ContractInstance() {
        return this.SNSIERC20
    }

    /* Main methods */

    // Get the SNS Approval
    async approve(address, amount) {
        return await this.SNSIERC20.approve(address, amount)
    }

    // 
    async allowance(owner, spender) {
        return await this.SNSIERC20.allowance(owner, spender)
    }


}
