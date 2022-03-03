import has from 'lodash/has'
import { getWithdrawContract } from './contracts'
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
        registry: '0x19AD2b1F012349645C3173EA63F98948A2b43d27'
    },
    80001: {
        registry: '0x4710b11a1a636b1b6b7bbb8c08b2758c1993aba2'
    }
}

export class SNSWithdraw {
    constructor({ networkId, registryAddress, provider }) {
        this.contracts = contracts
        const hasRegistry = has(this.contracts[networkId], 'registry')

        if (!hasRegistry && !registryAddress) {
            throw new Error(`Unsupported network ${networkId}`)
        } else if (this.contracts[networkId] && !registryAddress) {
            registryAddress = contracts[networkId].registry
        }

        this.registryAddress = registryAddress

        const SNSWithdrawContract = getWithdrawContract({ address: registryAddress, provider })
        this.SNSWithdraw = SNSWithdrawContract
    }

    /* Get the raw Ethers contract object */
    getSNSWithdrawContractInstance() {
        return this.SNSWithdraw
    }

    /* Main methods */

    // get KEYs fee value
    async getFeeValue() {
        return await this.SNSWithdraw.queryFeeValue()
    }

    // withdraw
    async withdraw() {
        const singner = await getSigner();
        const withdrawInstance = this.SNSWithdraw.connect(singner);
        // get fee value 
        const value = await this.getFeeValue()
        return await withdrawInstance.withdraw({ value });
    }

}