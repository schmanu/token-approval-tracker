# Token Approval Manager

The **Token Approval Manager** offers a convenient way to

 * Keep track of the safe’s ERC20 token approvals
 * Edit / revoke multiple approvals in a single transaction

## Motivation

ERC20 Approvals are widely used in all kinds of dapps which interact with ERC20 tokens (i.e. DEXes like Cowswap).
While the concept is very convenient it comes with certain risks and problems:

1. It gets really hard for users to keep track of how many approvals have been given to which dapps / contracts.
2. A lot of dapps set the approval to unlimited to save gas on future interactions / out of convenience.
3. Non malicious smart contracts can have vulnerabilities enabling malicious users to potential drain ERC20 tokens of others if allowances still exist
4. Malicious contracts exists with the goal to bait people into giving ERC20 approvals for this contracts to transfer all assets as soon as enough approvals are accumulated.

There are also some solutions out there to manage / revoke approvals. But none of them leverage that gnosis safes can batch send approve-calls making this app potentially the best solution out there.
 

## Prototype release:
https://ipfs.infura.io/ipfs/QmcJbWaSbKqybJX2xdnCJ8N7c3gqpkTE8cjoc7RKefLrTR


