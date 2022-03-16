# Reusable functions and components for the SNS apps

Most functions in this library are async functions and therefore return promises which can be awaited or chained with `.then`.

## Contracts
- ### [Registry](#Registry)
- ### [Resolvers](#Resolvers)
- ### [Withdraw](#Withdraw)

## Start
***

- ### [setup](#setup)

## <span id='setup'>`setup`</span>
 It can optionally provide a customProvider and an SNS address. In general, you don't need this unless you are running ganache.

It will return an object containing a registrar, sns object, network, provider object, and tithe contract object. sns object will handle name resolution, reverse logging, and handle the registry. The registrar object has the ability to interact with permanent registrars, traditional auction registrars and test registrars (just on the test network).

```js
import { setupSNS } from 'sns-app-contract-api'

window.addEventListener('load', async () => {
  const { registrar, sns } = await setupSNS()
  const owner = await sns.getOwner('linkkeydao.key')
  // will instantiate with window.web3/window.ethereum if found, read-only if not.
  // Once setup has finished you can now call functions off the library
})
```
## `async function setupSNS(options):void`

setupSNS must be called before anything other function in this library. We recommend calling it in a window.load event to make sure that your web3 object has loaded. You can provide a custom provider yourself, but by default it will look for `window.web3` or` window.ethereum` if you do not give it a provider. We use the custom provider when we need to run automated tests with ganache. You can also it pass it the registry address, but by default it will derive the network you are on and instantiate SNS using that network's registry. You only need to provider it with an sns address if you are on a private network.

### **Arguments**
```
 options (object): {
  customProvider (object): Provider object from web3 (optional)
  snsAddress (String): Address of the SNS registry (optional)
}
```

### **Example**
```js
import { setupSNS } from 'sns-app-contract-api'
window.addEventListener('load', async () => {
  const { sns, snsWithdraw, snsResolver, provider,network,providerObject } = await setupSNS()
})

```

## <span id='Registry'> Registry API</span>
***

- ### [registry()](#async-function-Registry-registry-name)
- ### [transfer()](#async-function-Registry-transfer-addressAndName)
- ### [getNameOfOwner()](#async-function-Registry-getNameOfOwner-address)
- ### [getResolverAddress()](#async-function-Registry-getResolver-addressName)
- ### [getResolverOwner()](#async-function-Registry-getResolverOwner-name)
- ### [getTokenIdOfName()](#async-function-Registry-getTokenIdOfName-name)
- ### [recordExists()](#async-function-Registry-recordExists-name)
- ### [getDomainDetails()](#async-function-Registry-getDomainDetails-name)
- ### [getRegisteredPrice()](#async-function-Registry-getRegisteredPrice)


### <span id='async-function-Registry-registry-name'>`async function registry(name)`</span>

This function is for a new domain name registration

#### **Arguments**
```
name:(string):Domain name to be registered
```

#### **Returns**  

#### transactionMsg(object): [Transcation response object](#transaction-response-object)

#### **Example**
```js
const name = 'sns.key'
const transactionObj = await sns.registry(name)
```

### <span id='async-function-Registry-transfer-addressAndName'>`async function transfer(address, name)`</span>

This function is used for transfers or transactions

#### **Arguments**
```
address(string):Eth address of the owner on the registry
name(string):An SNS name
```

#### **Returns**

#### transactionMsg(object): [Transcation response object](#transaction-response-object)

#### **Example**
```js
const address = '0x123abc...'
const name = 'sns.key'
const transactionObj = await sns.transfer(address, name)
```

### <span id='async-function-Registry-getNameOfOwner-address'>`async function getNameOfOwner(address)`</span>

Get the name of the owner

#### **Arguments**
```
address(string):Eth address of the owner on the registry
```

#### **Returns**
```
name(string):An SNS name
```

#### **Example**
```js
const name = await sns.getNameOfOwner('0x123abc...')
// sns.key
```

### <span id='async-function-Registry-getResolver-addressName'>`async function getResolverAddress(name)`</span>

Get the address of the parser

#### **Arguments**
```
name(string):An SNS name
```

#### **Returns**
```
address(string):The resolver address
```

#### **Example**
```js
const name = 'sns.key'
const address = await sns.getResolverAddress(name)
// 0x123abc...
```

### <span id='async-function-Registry-getResolverOwner-name'>`async function getResolverOwner`</span>

Get the address of the owner of this resolver

#### **Arguments**
```
name(string):An SNS name
```

#### **Returns**
```
address(string):An owner's resolver address
```

#### **Example**
```js
const name = 'sns.key'
const address = await getResolverOwner(name)
// 0x123abc...
```

### <span id='async-function-Registry-getTokenIdOfName-name'>`async function getTokenIdOfName`</span>

Get the token ID for this name

#### **Arguments**
```
name(string):An SNS name
```

#### **Returns**
```
tokenId(number):The token of the name
```

#### **Example**
```js
const name = 'sns.key'
const tokenId = await sns.getTokenIdOfName(name)
// 1
```

### <span id='async-function-Registry-recordExists-name'>`async function recordExists`</span>

Get whether the name record exists

#### **Arguments**
```
name(string):An SNS name
```

#### **Returns**
```
isExists(boolean):Whether the name record exists
```

#### **Example**
```js
const name = 'sns.key'
const isExists = await sns.recordExists(name)
// false/true
```

### <span id='async-function-Registry-getDomainDetails-name'>`async function getDomainDetails`</span>

Get some information about this domain

#### **Arguments**
```
name(string):An SNS name
```

#### **Returns**
```js
domainDetailsObj:{
    name: "test1.key", // An SNS name
    label: "test1", // An SNS name(remove suffix)
    labelhash: "0xc318..", // A hash value of an SNS name
    owner: "0x9cc..", // Address of owner
    resolver: "0xB20..", // The resolver address
    addr: null, // custom address
    content: null // custom content
}
```

#### **Example**
```js
const name = 'sns.key'
const detailsObj = await sns.getDomainDetails(name)
```

### <span id='async-function-Registry-getRegisteredPrice'>`async function getRegisteredPrice`</span>

Get Registration Price

#### **Returns**
```
price(number):Registration Fee
```

#### **Example**
```js
const price = await sns.getRegisteredPrice()
// 10
```

## <span id='Resolvers'> Resolvers API</span>
***

### [getAllProperties()](#async-function-getAllProperties-name)
### [setAllProperties()](#async-function-setAllProperties-name)

### <span id='async-function-getAllProperties-name'>`async function getAllProperties`</span>

#### **Arguments**
```
name(string):An SNS name
```

#### **Returns**
```
properties(string):Strings spliced with '+' (e.g:+xxx+yyy+zz+++aaa+b+)
```

#### **Example**
```js
const name = 'sns.key'
const record = await snsResolver.getAllProperties(name)
// +xxx+yyy+zzz+++sss+aaaa
```

### <span id='async-function-setAllProperties-name'>`async function setAllProperties`</span>

#### **Arguments**
```
name(string):An SNS name
records:(string):Strings spliced with '+' (e.g:+xxx+yyy+zz+++aaa+b+)
```

#### **Returns**

#### transactionMsg(object): [Transcation response object](#transaction-response-object)

#### **Example**
```js
const name = 'sns.key'
const recordStr = '+xxx+yyy+zzz+++sss+aaaa'
const transactionTx = await snsResolver.setAllProperties(name, recordStr)
```

## <span id='Withdraw'> Withdraw API</span>
***

### [getFeeValue()](#async-function-getFeeValue)
### [withdraw()](#async-function-withdraw)

### <span id='async-function-getFeeValue'>`async function getFeeValue`</span>

#### **Returns**
```
fee(number):User can withdraw balance
```
#### **Example**
```js
const fee = snsWithdraw.getFeeValue()
```

### <span id='async-function-withdraw'>`async function withdraw`</span>

#### **Returns**

#### transactionMsg(object): [Transcation response object](#transaction-response-object)

#### **Example**
```js
const transcationTx = await snsWithdraw.withdraw()
```
## <span id='transaction-response-object'>Transaction Response</span>
***
The transaction response object gets returned by the promise of all state modifying functions of the library. The most important properties is the `wait `function which can be called by the initial response, before the transaction has been mined. You can await this promise and it will give you the transaction receipt. The transaction receipt, is the same as the transaction response object, except is has a `blockHash`,`blockNumber` and `timestamp` of the block the transaction has been included in.

```js
{
    // Only available for unmined transactions
    wait: function(){}, //this function is to wait for the transaction to be mined
    // Only available for mined transactions
    blockHash: "0x7f20ef60e9f91896b7ebb0962a18b8defb5e9074e62e1b6cde992648fe78794b",
    blockNumber: 3346463,

    // Exactly one of these will be present (send vs. deploy contract)
    // They will always be a properly formatted checksum address
    creates: null,
    to: "0xc149Be1bcDFa69a94384b46A1F91350E5f81c1AB",

    // The transaction hash
    hash: "0xf517872f3c466c2e1520e35ad943d833fdca5a6739cfea9e686c4c1b3ab1022e",

    // See above "Transaction Requests" for details
    data: "0x",
    from: "0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8",
    gasLimit: utils.bigNumberify("90000"),
    gasPrice: utils.bigNumberify("21488430592"),
    value: utils.parseEther(1.0017071732629267),

    // The chain ID; 0 indicates replay-attack vulnerable
    // (eg. 1 = Homestead mainnet, 3 = Ropsten testnet)
    chainId: 1,

    // The signature of the transaction (TestRPC may fail to include these)
    r: "0x5b13ef45ce3faf69d1f40f9d15b0070cc9e2c92f3df79ad46d5b3226d7f3d1e8",
    s: "0x535236e497c59e3fba93b78e124305c7c9b20db0f8531b015066725e4bb31de6",
    v: 37,

    // The raw transaction (TestRPC may be missing this)
    raw: "0xf87083154262850500cf6e0083015f9094c149be1bcdfa69a94384b46a1f913" +
           "50e5f81c1ab880de6c75de74c236c8025a05b13ef45ce3faf69d1f40f9d15b0" +
           "070cc9e2c92f3df79ad46d5b3226d7f3d1e8a0535236e497c59e3fba93b78e1" +
           "24305c7c9b20db0f8531b015066725e4bb31de6",
}
```