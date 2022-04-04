import { getIERC20Contract } from './contracts'
import {
    getSigner
} from './web3'

export class SNSIERC20 {

    constructor({ registryAddress, provider }) {

        if (!registryAddress) {
            throw new Error(`Unsupported network`)
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
        const singner = await getSigner();
        const IERC20Instance = this.SNSIERC20.connect(singner);
        return await IERC20Instance.approve(address, amount)
    }

    // 
    async allowance(owner, spender) {
        return await this.SNSIERC20.allowance(owner, spender)
    }


}
