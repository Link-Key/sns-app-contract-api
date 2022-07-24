import {
  getProvider,
  setupWeb3,
  getNetworkId,
  getNetwork,
  getAccount
} from './web3'
import { ENS } from './ens.js'
import { setupRegistrar } from './registrar'
export { utils, ethers } from 'ethers'
import { SNS } from './sns.js'
import { SNSResolver } from './sns.resolver'
import { SNSWithdraw } from './withdraw.js'
import { SNSIERC20 } from './IERC20'
import {Invite} from "./invite";

export async function setupENS({
  customProvider,
  ensAddress,
  reloadOnAccountsChange,
  enforceReadOnly,
  enforceReload,
  infura
} = {}) {
  const { provider } = await setupWeb3({
    customProvider,
    reloadOnAccountsChange,
    enforceReadOnly,
    enforceReload,
    infura
  })
  const networkId = await getNetworkId()
  const ens = new ENS({ provider, networkId, registryAddress: ensAddress })
  const registrar = await setupRegistrar(ens.registryAddress)
  const network = await getNetwork()
  return {
    ens,
    registrar,
    provider: customProvider,
    network,
    providerObject: provider
  }
}

export async function setupSNS({
  customProvider,
  ensAddress,
  reloadOnAccountsChange,
  enforceReadOnly,
  enforceReload,
  infura
} = {}) {
  const { provider } = await setupWeb3({
    customProvider,
    reloadOnAccountsChange,
    enforceReadOnly,
    enforceReload,
    infura
  })
  const networkId = await getNetworkId()
  // get sns and resolver instance
  const sns = new SNS({ provider, networkId, registryAddress: ensAddress })
  // Get the address of the parser
  // const name = await sns.getSNSName(getAccount())
  const snsResolver = new SNSResolver({ networkId, provider })
  // get widthdraw instance
  const snsWithdraw = new SNSWithdraw({ provider, networkId, registryAddress: ensAddress })

  // get sns and resolver instance
  const invite = new Invite({ provider, networkId, registryAddress: ensAddress })

  const network = await getNetwork()

  return {
    sns,
    snsWithdraw,
    snsResolver,
    invite,
    provider: customProvider,
    network,
    providerObject: provider
  }
}

export async function setupSNSResolver({
  customProvider,
  ensAddress,
  reloadOnAccountsChange,
  enforceReadOnly,
  enforceReload,
  infura,
  name,
  sns
} = {}) {
  const { provider } = await setupWeb3({
    customProvider,
    reloadOnAccountsChange,
    enforceReadOnly,
    enforceReload,
    infura
  })
  const networkId = await getNetworkId()
  let newVar = await sns.isOverDeadline()
  // Get the address of the parser
  if (name) {
    const resolverAddress = await sns.getResolverAddress(name)
    return new SNSResolver({ networkId, resolverAddress, provider })
  }
  return {}
}

// withdraw coins Instance
export async function callWithdraw({
  customProvider,
  ensAddress,
  reloadOnAccountsChange,
  enforceReadOnly,
  enforceReload,
  infura
} = {}) {
  const { provider } = await setupWeb3({
    customProvider,
    reloadOnAccountsChange,
    enforceReadOnly,
    enforceReload,
    infura
  })
  const networkId = await getNetworkId()
  // get sns and resolver instance
  const snsWithdraw = new SNSWithdraw({ provider, networkId, registryAddress: ensAddress })

  const network = await getNetwork()

  return {
    snsWithdraw,
    provider: customProvider,
    network,
    providerObject: provider
  }
}

// withdraw coins Instance
export async function setupInvite({
   customProvider,
   ensAddress,
   reloadOnAccountsChange,
   enforceReadOnly,
   enforceReload,
   infura
 } = {}) {
  const { provider } = await setupWeb3({
    customProvider,
    reloadOnAccountsChange,
    enforceReadOnly,
    enforceReload,
    infura
  })
  const networkId = await getNetworkId()
  // get sns and resolver instance
  const invite = new Invite({ provider, networkId, registryAddress: ensAddress })

  const network = await getNetwork()

  return {
    invite,
    provider: customProvider,
    network,
    providerObject: provider
  }
}


// ERC20 Instance
export async function setupIERC20({
  snsAddress, provider
} = {}) {
  // get IERC20 instance
  const snsIERC20 = new SNSIERC20({ registryAddress: snsAddress, provider })
  return snsIERC20
}

export * from './ens'
export * from './registrar'
export * from './web3'
export * from './constants/interfaces'
export * from './utils'
export * from './contracts'
export * from './sns'
export * from './sns.resolver'
