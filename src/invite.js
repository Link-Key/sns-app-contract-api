import has from 'lodash/has'
import { Contract, utils } from 'ethers'
import Web3 from 'web3'
import {
  getWeb3,
  getNetworkId,
  getProvider,
  getAccount,
  getSigner
} from './web3'


import { getInviteContract } from './contracts'

/* Utils */

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
    registry: '0x9eB9C38c37860FF89830c7442721e1cC4F69ea7B'
  }
}

export class Invite {
  constructor({ networkId, registryAddress, provider }) {
    this.contracts = contracts
    const hasRegistry = has(this.contracts[networkId], 'registry')

    if (!hasRegistry && !registryAddress) {
      throw new Error(`Unsupported network ${networkId}`)
    } else if (this.contracts[networkId] && !registryAddress) {
      registryAddress = contracts[networkId].registry
    }

    this.registryAddress = registryAddress

    const inviteContract = getInviteContract({ address: registryAddress, provider })
    this.Invite = inviteContract
  }

  /* Get the raw Ethers contract object */
  getInviteContractInstance() {
    return this.Invite
  }

  async addInviter() {
    const signer = await getSigner()
    const Invite = this.Invite.connect(signer)
    return await Invite.addInviter()
  }

  // sns name transfer
  async isInviter() {
    const address = await getAccount()
    return await this.Invite.isInviter(address)
  }

  async getApplyInviterPrice(){
    return await this.Invite.getApplyInviterPrice()
  }

  async inviteDiscountRate(){
    return await this.Invite.inviteDiscountRate()
  }




  // Events
  async getInviterEvent(event, { topics, fromBlock }) {
    const provider = await getWeb3()
    const { Invite } = this
    const ensInterface = new utils.Interface(ensContract)
    let Event = Invite.filters[event]()

    const filter = {
      fromBlock,
      toBlock: 'latest',
      address: Event.address,
      topics: [...Event.topics, ...topics]
    }

    const logs = await provider.getLogs(filter)

    const parsed = logs.map(log => {
      const parsedLog = ensInterface.parseLog(log)
      return parsedLog
    })

    return parsed
  }
}
