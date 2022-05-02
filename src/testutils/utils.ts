import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

import { ERC20__factory } from '../contracts';
import { toWei } from '../utils/wei';

const erc20Interface = ERC20__factory.createInterface();

const mockLogEntry = [
  {
    address: '0xd0dab4e640d95e9e8a47545598c33e31bdb53c7c',
    blockHash: '0x8061c92208023a830baf4ad942b1d3def22b88e7f4f33e691b502cc631f56782',
    blockNumber: '0x9a059b',
    data: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    logIndex: '0x10',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x0000000000000000000000007d9a7d9c72e2905b8f6cc866f33c594895df6c6c',
      '0x000000000000000000000000c92e8bdf79f0507f65a392b0ab4667716bfe0110',
    ],
    transactionHash: '0x33c46c9eaec16730531d888406e8ad7d64c47d3b2f5fb92685ef967029fe4fee',
    transactionIndex: '0xe',
  },
];

const mockBlock = {
  baseFeePerGas: '0xe',
  difficulty: '0x2',
  extraData:
    '0xd883010a0e846765746888676f312e31372e33856c696e757800000000000000e6b34361497ca49917721fbc64db5b0c5538610c026902e4c6e8329a8f3b3e82241775378c29c3435c5ce1739adf5a05ab3fbfa6debcff6b93d7bddd687e8c8401',
  gasLimit: '0x1c950f4',
  gasUsed: '0x43f263',
  hash: '0x8061c92208023a830baf4ad942b1d3def22b88e7f4f33e691b502cc631f56782',
  logsBloom:
    '0x002282204028008000080380c006c0000180000040024650800400042440420020030050024000008020006021800020000040400026601000900100002020110444000001020000090a20080080002201050508004080000020000220002a204000002002080000240100080008080981400a0040000400002001b8110080084100000440061000800988028003000108008004000440480044004004200004121082180c00200600000046408034281002000042280080000000e8000008011000800201440100420880110000100840009000204804d20080a102341020102010108800d200040000028000020a40024820010048800000808c0020600021',
  miner: '0x0000000000000000000000000000000000000000',
  mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  nonce: '0x0000000000000000',
  number: '0x9a059b',
  parentHash: '0x42d7e77b248945356dcd6512bd320a3e6f3adb199f951da675a0eb8f4597e0d5',
  receiptsRoot: '0xd58480b23213ee04b38b49eb259d3f435eb5b9f4041d1ae5e86eabae5744168c',
  sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
  size: '0x3a78',
  stateRoot: '0x2b4f26135def4fe793547b6a3b601dc3ab9dda29acf79f00d7a612db9e87f2ad',
  timestamp: '0x61f95b60',
  totalDifficulty: '0x10111e1',
  transactions: [],
  transactionsRoot: '0x55d5b41ddd98ab3bead90808f2532bdbcfb37e416046079c74bcb74435306bd7',
  uncles: [],
};

interface MockApprovalData {
  tokenAddress: string;
  ownerAddress: string;
  spenderAddress: string;
  allowance: BigNumber;
  timeStamp: number;
}

const createMockApprovalLogEntries = (dataArray: MockApprovalData[] | undefined, decimals?: number) => {
  const result =
    dataArray?.map((data) => ({
      ...mockLogEntry[0],
      address: data.tokenAddress,
      data: ethers.utils.hexZeroPad(
        ethers.utils.hexlify(ethers.BigNumber.from(toWei(data.allowance, decimals ?? 18).toFixed())),
        32,
      ),
      blockHash: ethers.utils.hexZeroPad(ethers.utils.hexlify(data.timeStamp), 32),
      topics: [
        '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925', // Approval ID
        data.ownerAddress,
        data.spenderAddress,
      ],
      transactionHash: ethers.utils.hexZeroPad(ethers.utils.hexlify(data.timeStamp), 32),
    })) ?? [];
  return result;
};

export const createMockSafeAppProvider: (returnData: {
  decimals?: number;
  allowance?: BigNumber;
  approvalLogs?: MockApprovalData[];
}) => SafeAppProvider = (returnData) => {
  return {
    request: async (request: { method: string; params?: any[] }) => {
      const { method, params } = request;
      switch (method) {
        case 'eth_chainId':
        case 'net_version':
          return Promise.resolve(1);
        case 'eth_call':
          if (params) {
            const data: string = params[0].data;
            const method = erc20Interface.getFunction(data.slice(0, 10));

            switch (method.name) {
              case 'decimals':
                if (typeof returnData.decimals !== 'undefined') {
                  return Promise.resolve(ethers.utils.defaultAbiCoder.encode(['uint8'], [returnData.decimals]));
                }
                break;
              case 'allowance':
                if (typeof returnData.decimals !== 'undefined' && typeof returnData.allowance !== 'undefined') {
                  return Promise.resolve(
                    ethers.utils.defaultAbiCoder.encode(
                      ['uint256'],
                      [toWei(returnData.allowance, returnData.decimals).toFixed()],
                    ),
                  );
                }
            }
          }
          break;
        case 'eth_getLogs':
          return Promise.resolve(createMockApprovalLogEntries(returnData.approvalLogs));
        case 'eth_getBlockByHash':
          return {
            ...mockBlock,
            timestamp: params ? params[0] : '0x0',
          };
      }
      return Promise.resolve(undefined);
    },
  } as SafeAppProvider;
};
