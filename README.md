# Reusable functions and components for the SNS apps

Most functions in this library are async functions and therefore return promises which can be awaited or chained with `.then`.

## Contents

- Registry and Resolvers

  - [setupSNS()](#async-function-setupensoptions-void)
  - [getOwner()](#async-function-getownername-address)
  - [getResolver()](#async-function-getresolvername-address)
  - [getTTL()](#async-function-getttlname-number)
  - [getOwnerWithLabelhash()](#async-function-getownerwithlabelhashlabelhash-nodehash-address)
  - [getResolverWithLabelhash()](#async-function-getresolverwithlabelhashlabelhash-nodehash-address)
  - [getAddress()](#async-function-getaddressname-address)
  - [getAddr()](#async-function-getaddrname-key-address)
  - [getContent()](#async-function-getcontentname-contenthash)
  - [getText()](#async-function-gettextname-key-value)
  - [getName()](#async-function-getnameaddress-name)
  - [getSubdomains()](#async-function-getsubfomains-address)
  - [setSubnodeOwner()](#async-function-setsubnodeownername-newowner-transactionresponse)
  - [setSubnodeRecord()](#async-function-setsubnoderecordname-newowner-resolver-transactionresponse)
  - [setResolver()](#async-function-setresolvername-resolver-transactionresponse)
  - [setAddress()](#async-function-setaddressname-address-transactionresponse)
  - [setAddr()](#async-function-setaddrname-key-address-transactionresponse)
  - [setContent() DEPRECATED](#async-function-setcontentname-content-transactionresponse-deprecated)
  - [setContenthash()](#async-function-setcontenthashname-content-transactionresponse)
  - [setText()](#async-function-settextname-key-value-transactionresponse)
  - [checkSubdomain()](#async-function-checksubdomainlabel-name-boolean)
  - [createSubdomain()](#async-function-createsubdomainlabel-name-transactionresponse)
  - [deleteSubdomain()](#async-function-deletesubdomainlabel-name-transactionresponse)
  - [claimAndSetReverseRecord()](#async-function-claimandsetreverserecordnamename-transactionresponse)
  - [setReverseRecord](#async-function-setreverserecordnamename-transactionresponse)
  - [getDomainDetails](#async-function-getdomaindetailsname-transactionresponse)
  - [getSubdomains](#async-function-getsubdomainsname-arraysubdomain)

- [Transaction Response](#transaction-response)

## Setup

Setup for the library is done by calling the `setupENS` function. It can be optionally provided with a customProvider and an ENS address. Generally you won't need this unless you are running ganache.

It will return an object with the registrar and ens object. The ens object will deal with name resolution, reverse records and dealing with the registry. The registrar object has functions to interact the permanent registrar, legacy auction registrar and test registrar (just on test net)

```js
import { setupSNS } from '@ensdomains/ui'

window.addEventListener('load', async () => {
  const { registrar, ens } = await setupSNS()
  const owner = await ens.getOwner('resolver.eth')
  // will instantiate with window.web3/window.ethereum if found, read-only if not.
  // Once setup has finished you can now call functions off the library
})
```

## API

### `async function setupSNS(options): void`

setupSNS must be called before anything other function in this library. We recommend calling it in a window.load event to make sure that your web3 object has loaded. You can provide a custom provider yourself, but by default it will look for `window.web3` or `window.ethereum` if you do not give it a provider. We use the custom provider when we need to run automated tests with ganache. You can also it pass it the registry address, but by default it will derive the network you are on and instantiate ENS using that network's registry. You only need to provider it with an ens address if you are on a private network.


#
```

### `async function deleteSubdomain(label, name): TransactionResponse`

Can only be called by the controller of the name. This function will set the controller to `0x000...` and if it has a resolver, it will set the resolver `0x000...`, which will be a second transaction. Alternatively you can manually call `setSubnodeOwner` and set the controller to `0x000...`

#### Arguments

label (String): ENS Label e.g: sub (sub.vitalik.eth)
name (String): An ENS name

#### Returns

transaction (object): [Transaction Response Object](#transaction-response)

#### Example

```js
const tx = await ens.deleteSubdomain('sub', 'vitalik.eth')
console.log(tx.hash)
// 0x123456...
const receipt = await tx.wait() // Wait for transaction to be mined
// Transaction has been mined
```

### `async function claimAndSetReverseRecordName(name): TransactionResponse`

This function will claim your Ethereum address on the reverse registrar, setup the reverse resolver and setup your name on the resolver all in one transaction. It can also be used to change your reverse record name to something else.

#### Arguments

name (String): An ENS name

#### Returns

transaction (object): [Transaction Response Object](#transaction-response)

#### Example

```js
const tx = await ens.claimAndSetReverseRecordName('vitalik.eth')
console.log(tx.hash)
// 0x123456...
const receipt = await tx.wait() // Wait for transaction to be mined
// Transaction has been mined
```

