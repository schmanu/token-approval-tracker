import { action, makeObservable, observable } from 'mobx';

import { AccumulatedApproval } from '../../components/TransactionDataContext';

import { fetchTokenInfo, TokenInfo } from './TokenService';

export class TokenStore {
  isTokenDataLoading = true;
  tokenInfoMap: Map<string, TokenInfo> = new Map();

  constructor() {
    makeObservable(this, {
      isTokenDataLoading: observable,
      tokenInfoMap: observable,
      loadTokenInfo: action,
      setTokenInfo: action,
    });
  }

  loadTokenInfo = (approvalTransactions: AccumulatedApproval[], network: number) => {
    const promisedTokens = approvalTransactions.map((approval) => fetchTokenInfo(approval.tokenAddress, network));
    Promise.all(promisedTokens)
      .then((tokenResults) => {
        const entries: [string, TokenInfo][] = (
          tokenResults.filter((result) => typeof result !== 'undefined') as TokenInfo[]
        ).map((result) => [result.address, result]);
        this.setTokenInfo(new Map<string, TokenInfo>(entries));
      })
      .catch(() => {
        this.isTokenDataLoading = false;
      });
  };

  setTokenInfo = (map: Map<string, TokenInfo>) => {
    this.tokenInfoMap = map;
    this.isTokenDataLoading = false;
  };
}
