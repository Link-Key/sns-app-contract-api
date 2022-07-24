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
import { formatsByName } from '@ensdomains/address-encoder'

import { decryptHashes } from './preimage'

import {
  uniq,
  getEnsStartBlock,
  checkLabels,
  mergeLabels,
  emptyAddress,
  isDecrypted,
  namehash,
  labelhash
} from './utils'
import { encodeLabelhash } from './utils/labelhash'

import { getSNSContract } from './contracts'
import { nameRemoveSuffix } from './utils/namehash'

/* Utils */

export function getNamehash(name) {
  return namehash(name)
}

async function getNamehashWithLabelHash(labelHash, nodeHash) {
  let node = utils.keccak256(nodeHash + labelHash.slice(2))
  return node.toString()
}

function getLabelhash(label) {
  return labelhash(label)
}

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
    registry: '0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176'
  }
}

export class SNS {
  constructor({ networkId, registryAddress, provider }) {
    this.contracts = contracts
    const hasRegistry = has(this.contracts[networkId], 'registry')

    if (!hasRegistry && !registryAddress) {
      throw new Error(`Unsupported network ${networkId}`)
    } else if (this.contracts[networkId] && !registryAddress) {
      registryAddress = contracts[networkId].registry
    }

    this.registryAddress = registryAddress

    const SNSContract = getSNSContract({ address: registryAddress, provider })
    this.SNS = SNSContract
  }

  /* Get the raw Ethers contract object */
  getSNSContractInstance() {
    return this.SNS
  }

  /* Main methods */
  //Get the number of castings in the system


  //registry
  async registry(name,invite) {
    const signer = await getSigner()
    const SNS = this.SNS.connect(signer)
    let isShortName = await this.getShortNameAllowedlist()
    if (isShortName) {
      return await SNS.shortNameMint(nameRemoveSuffix(name))
    } else {
      const value = await this.getRegisteredPrice()
      return await SNS.mint([nameRemoveSuffix(name),invite], { value })
    }
  }

  // 0 addressRegistered: true
  // 1 nameOfOwner: "peifeng22.key"
  // 2 nameOfTokenId: ""
  // 3 recordExists: false
  // 4 resolverAddress: "0x0000000000000000000000000000000000000000"
  // 5 resolverOwner: "0x0000000000000000000000000000000000000000"
  // 6 shortNameAllowed: false
  // 7 tokenIdOfName: BigNumber {_hex: '0x00', _isBigNumber: true}

  async getInfo(addr_,name_,tokenId_){
    const info = await this.SNS.getInfo(addr_,name_,tokenId_)
    return info
  }

  async getShortNameAllowedlist() {
    const address = await getAccount()
    const info = await this.getInfo(address,"",0)
    return info[6]
  }

  // sns name transfer
  async transfer(address, name) {
    const signer = await getSigner()
    const SNS = this.SNS.connect(signer)
    return await SNS.transfer(address, name)
  }

  // getSNSName
  //Get the registered SNSName by address
  async getNameOfOwner(address) {
    const info = await this.getInfo(address,"",0)
    return info[2]
  }

  //Get the resolver address through SNSName
  async getResolverAddress(name) {
    const info = await this.getInfo(emptyAddress,name,0)
    return info[4];
  }

  //Custom parser
  async setResolverInfo(name, address) {
    const signer = await getSigner()
    const SNS = this.SNS.connect(signer)
    return SNS.setResolverInfo(nameRemoveSuffix(name), address)
  }

  //Get resolverOwner address
  async getResolverOwner(name) {
    const info = await this.getInfo(emptyAddress,name,0)
    return info[5];
  }

  async getTokenIdOfName(name) {
    const info = await this.getInfo(emptyAddress,name,0)
    return info[7];
  }

  //Get recordExists
  async recordExists(name) {
    const info = await this.getInfo(emptyAddress,name,0)
    return info[3];
  }

  async getDomainDetails(name) {
    const labelhash = getLabelhash(name)
    const signer = await getSigner()
    const SNS = this.SNS.connect(signer)
    const [owner, resolver] = await Promise.all([
      this.getResolverOwner(name),
      this.getResolverAddress(name)
    ])
    const node = {
      name,
      label: name.split('.key')[0],
      labelhash,
      owner,
      resolver
    }

    // const hasResolver = parseInt(node.resolver, 16) !== 0

    // if (hasResolver) {
    //   return this.getResolverDetails(node)
    // }

    return {
      ...node,
      addr: null,
      content: null
    }
  }

  async getRegisteredPrice() {
    const price = await this.SNS.getPrice(emptyAddress)
    return price.maticPrice
  }

  async getOtherCoinPrice(type,invite){
    const coin = await this.SNS.getCoinsInfo(type);
    if(type!=1){
      invite = emptyAddress;
    }
    const price = await this.SNS.getPrice(invite)
    let coinPirce;
    switch (type) {
      case 1:
        coinPirce = price.keyPrice
        break;
      case 2:
        coinPirce = price.lowbPrice
        break;
      case 3:
        coinPirce = price.usdcPrice
        break;
      default:
        break;
    }
    return {
      address:coin[0],
      price:coinPirce
    }
  }

  // get key coins address
  async getKeyCoinsAddress() {
    const coinsInfo = await this.SNS.getCoinsInfo(1)
    return coinsInfo[0]
  }

  async getLowbCoinsAddress() {
    const coinsInfo = await this.SNS.getCoinsInfo(2)
    console.log(coinsInfo)
    return coinsInfo[0]
  }

  async getUsdcCoinsAddress() {
    const coinsInfo = await this.SNS.getCoinsInfo(3)
    console.log(coinsInfo)
    return coinsInfo[0]
  }

  // get key coins price
  async getKeyCoinsPrice(invite) {
    const price = await this.SNS.getPrice(invite)
    return price.keyPrice
  }

  async getLowbCoinsPrice() {
    const price = await this.SNS.getPrice(emptyAddress)
    return price.lowbPrice
  }

  async getUsdcCoinsPrice() {
    const price = await this.SNS.getPrice(emptyAddress)
    return price.usdcPrice
  }

  // mint key coins 
  async mintByMoreCoins(name, coinsType,invite) {
    const signer = await getSigner()
    const SNS = this.SNS.connect(signer)
    if(type!=1){
      invite = emptyAddress
    }
    return await SNS.mintByMoreCoins(name, coinsType,invite)
  }

  // Events

  /**
   event FreeMint(address sender_,string name_);
   event Mint(address sender_,string name_);
   event SetResolverInfo(address sender_, string name_, address resolverAddress_);
   event TransferName(address sender_, address form_, address to_, string name_);
   */
  async getSNSEvent(event, { topics, fromBlock }) {
    const provider = await getWeb3()
    const { SNS } = this
    const ensInterface = new utils.Interface(ensContract)
    let Event = SNS.filters[event]()

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
