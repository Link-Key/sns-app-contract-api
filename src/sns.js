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

import {SNSIERC20} from './IERC20'

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
    registry: '0x362945C3ffa822854240788EcdB509f104E56588'
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
  async mint(name,coinsType,inviter) {
    const signer = await getSigner()
    const SNS = this.SNS.connect(signer)

    const minter = await getAccount()
    console.log('registryCoinsType:',coinsType)

    const priceInfo = await this.getPriceInfo(minter,nameRemoveSuffix(name),inviter);
    let coinAddress;
    let coinPrice = 0;
    let allowanceValue;
    let erc20;
    const provider = await getProvider()
    switch (coinsType) {
      case 0:
        coinPrice = priceInfo.maticPrice;
        break;
      case 1:
        coinAddress = priceInfo.keyAddress;
        coinPrice = priceInfo.keyPrice;
        erc20 = new SNSIERC20(coinAddress,provider);
        allowanceValue = await erc20.allowance(minter,this.registryAddress);
        if(allowanceValue<coinPrice){
          await erc20.approve(this.registryAddress,coinPrice);
        }
        break;
      case 2:
        coinAddress = priceInfo.lowbAddress;
        coinPrice = priceInfo.lowbPrice;
        erc20 = new SNSIERC20(coinAddress,provider);
        allowanceValue = await erc20.allowance(minter,this.registryAddress);
        if(allowanceValue<coinPrice){
          await erc20.approve(this.registryAddress,coinPrice);
        }
        break;
      case 3:
        coinAddress = priceInfo.usdcAddress;
        coinPrice = priceInfo.usdcPrice;
        erc20 = new SNSIERC20({registryAddress:coinAddress,provider});
        allowanceValue = await erc20.allowance(minter,this.registryAddress);
        if(allowanceValue<coinPrice){
          await erc20.approve(this.registryAddress,coinPrice);
        }
        break;
      default:
        break;
    }
    return await SNS.mint(nameRemoveSuffix(name), coinsType, inviter, { value:coinsType === 0 ? coinPrice : 0 })
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
    return info.nameOfOwner;
  }

  //Get the resolver address through SNSName
  async getResolverAddress(name) {
    const info = await this.getInfo(emptyAddress,name,0)
    return info.resolverAddress;
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
    return info.resolverOwner;
  }

  async getTokenIdOfName(name) {
    const info = await this.getInfo(emptyAddress,name,0)
    return info.tokenIdOfName;
  }

  //Get recordExists
  async recordExists(name) {
    const info = await this.getInfo(emptyAddress,name,0)
    return info.recordExists;
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


  async getPriceInfo(minter,name,inviter){
    let  priceInfo = {};
    const keyInfo = await this.SNS.getCoinsInfo(1);
    const lowbInfo = await this.SNS.getCoinsInfo(2);
    const usdcInfo = await this.SNS.getCoinsInfo(3);
    const price = await this.SNS.getPrice(minter,name,inviter)
    priceInfo.maticPrice = price.maticPrice;
    priceInfo.keyPrice = price.keyPrice;
    priceInfo.keyAddress = keyInfo[0];
    priceInfo.lowbPrice = price.lowbPrice;
    priceInfo.lowbAddress = lowbInfo[0];
    priceInfo.usdcPrice = price.usdcPrice;
    priceInfo.usdcAddress = usdcInfo[0];
    return priceInfo
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
