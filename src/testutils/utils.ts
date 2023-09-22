import { SafeAppProvider } from '@safe-global/safe-apps-provider';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

import { ERC20__factory } from '../contracts';
import { toWei } from '../utils/wei';
export const ERROR_CAUSING_SPENDER = '0x7d9a7d9c72e2905b8f6cc866f33c594895df6c6c';

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

interface MockApprovalData {
  tokenAddress: string;
  ownerAddress: string;
  spenderAddress: string;
  allowance: BigNumber;
  logIndex: number;
  blockNumber: number;
}

type LogReturnType = 'generated' | 'bugReportLog';

const createMockApprovalLogEntries = (dataArray: MockApprovalData[] | undefined, decimals?: number) => {
  const result =
    dataArray?.map((data) => ({
      ...mockLogEntry[0],
      address: data.tokenAddress,
      data: ethers.utils.hexZeroPad(
        ethers.utils.hexlify(ethers.BigNumber.from(toWei(data.allowance, decimals ?? 18).toFixed())),
        32,
      ),
      topics: [
        '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925', // Approval ID
        data.ownerAddress,
        data.spenderAddress,
      ],
      logIndex: ethers.utils.hexlify(data.logIndex),
      blockNumber: ethers.utils.hexlify(data.blockNumber),
    })) ?? [];
  return result;
};

export const createMockSafeAppProvider: (returnData: {
  decimals?: number;
  allowance?: BigNumber;
  approvalLogs?: MockApprovalData[];
  logReturnType?: LogReturnType;
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
                  const decoded = erc20Interface.decodeFunctionData('allowance', data);
                  const spender = decoded['spender'] as string;
                  if (spender.toLowerCase() === ERROR_CAUSING_SPENDER.toLowerCase()) {
                    return Promise.reject('Invalid spender address');
                  }
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
          if (returnData.logReturnType === 'bugReportLog') {
            return Promise.resolve(errorLogEntry);
          }
          return Promise.resolve(createMockApprovalLogEntries(returnData.approvalLogs));
      }
      return Promise.resolve(undefined);
    },
  } as SafeAppProvider;
};

const errorLogEntry = [
  {
    address: '0x3c990b4b572f45cfe93c648cb7fef0ed52d5c5c3',
    blockHash: '0x94ecfbab12e794414157de847cd192c7a1b6b00b3ec406e167808b9acb8c0074',
    blockNumber: '0x91604f',
    data: '0x',
    logIndex: '0x0',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x000000000000000000000000000000000000000000000000000000000000109e',
    ],
    transactionHash: '0x37c7791a2a0dc7f6241438c3524caf3f0f3fa747be4fb58f718895e2c42478e2',
    transactionIndex: '0x0',
  },
  {
    address: '0x3c990b4b572f45cfe93c648cb7fef0ed52d5c5c3',
    blockHash: '0xbd062f4810c7b9583e865d62bd6b82f5870d25e9e9b4070caa74ec6b56aa661c',
    blockNumber: '0x91607d',
    data: '0x',
    logIndex: '0x0',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x000000000000000000000000000000000000000000000000000000000000109e',
    ],
    transactionHash: '0xddab67e30dfd1137dc82e9bc6d7d469af5930670be48df5b16ba997b3d8bf4cd',
    transactionIndex: '0x0',
  },
  {
    address: '0x22a85858b09db828d560f69cddd486ca2ae9dc72',
    blockHash: '0x01096bc1e7fc9cf4e1287d6952533889097af6af1932fdb17cc61133a5773422',
    blockNumber: '0x91b404',
    data: '0x',
    logIndex: '0x0',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x000000000000000000000000000000000000000000000000000000000000028a',
    ],
    transactionHash: '0x2f442432347da239e3e1f68981af52ae7d97f4eaf3b2e34ece53b865587aa6d1',
    transactionIndex: '0x0',
  },
  {
    address: '0x3c990b4b572f45cfe93c648cb7fef0ed52d5c5c3',
    blockHash: '0xc85af32edcc884dca4b2d1aa1cc6c987263f2ea83c3ab212b8ba750782a21c54',
    blockNumber: '0x91b41a',
    data: '0x',
    logIndex: '0x1',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x000000000000000000000000000000000000000000000000000000000000109e',
    ],
    transactionHash: '0xbbf7c77b704a47b7e2b6248f7dec29af430ba886ae8b3005b347af10f1a49f56',
    transactionIndex: '0x1',
  },
  {
    address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    blockHash: '0x4cc8aad8c1ed5968288ea4c117974bb971b4f6f2def98210961363ccfefc2f87',
    blockNumber: '0x92be3f',
    data: '0x0000000000000000000000000000000000000000000000008ac7230489e80000',
    logIndex: '0x1',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000006d7f0754ffeb405d23c51ce938289d4835be3b14',
    ],
    transactionHash: '0x8f885ea59504d88fb5215b8049e245d7928b6b59511d78727abed3da314322ff',
    transactionIndex: '0x1',
  },
  {
    address: '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735',
    blockHash: '0xde31a6f593872d14fe164cd6bed865d47fcf6cb770be7f2f4c12e5e18f484527',
    blockNumber: '0x92bebd',
    data: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    logIndex: '0x1',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d',
    ],
    transactionHash: '0x21001a822c1a9d80319b70ebc12f2a6a5f71bdd55882ff02e045d7adfdcca716',
    transactionIndex: '0x2',
  },
  {
    address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    blockHash: '0xfd3c08586ba7ab8706a2258d4c6d8d62b3455dbba7d1e8db4626ff73f1dc103e',
    blockNumber: '0x93d109',
    data: '0x0000000000000000000000000000000000000000000000008ac7230489e80000',
    logIndex: '0x0',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000009ea007843318b9ecd85f93ecc55d4e19143f007a',
    ],
    transactionHash: '0xdbfa5730e816b6bd42a48c91d7a29f61deb76d958e2a57d462630a86812d7755',
    transactionIndex: '0x0',
  },
  {
    address: '0xc778417e063141139fce010982780140aa0cd5ab',
    blockHash: '0x617be6364a717a21253a8c0d055d8014983db7bc8842ba45884f98141ddc2972',
    blockNumber: '0x93e47d',
    data: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    logIndex: '0x1',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x000000000000000000000000c1f3af5dc05b0c51955804b2afc80ef8feed67b9',
    ],
    transactionHash: '0xe330f39fb654991cac9dd7381e92430605ad10f19a78675b75cdce9439cb2527',
    transactionIndex: '0x1',
  },
  {
    address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    blockHash: '0xa2f4f7d3a6d74a323a422d601b11ba7b98f48d42af56a8664759f117eefbde9b',
    blockNumber: '0x93e857',
    data: '0x0000000000000000000000000000000000000000000000008ac7230489e80000',
    logIndex: '0x1',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000006d7f0754ffeb405d23c51ce938289d4835be3b14',
    ],
    transactionHash: '0x3747b70f7e000ee8b1d23fd11eadf30a346160a102271d8bf64ad83c9527edee',
    transactionIndex: '0x1',
  },
  {
    address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    blockHash: '0xf4c892e4156cde1dfeb6ab39832acd72ec6fda46a1472391f55397c5dd8f9c38',
    blockNumber: '0x93f839',
    data: '0x0000000000000000000000000000000000000000000000004563918244f40000',
    logIndex: '0x0',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000009ea007843318b9ecd85f93ecc55d4e19143f007a',
    ],
    transactionHash: '0x9046bc4bc0d2b619b6c57aa93036be88b1c941ccb998f372767b732dcf4d5ee0',
    transactionIndex: '0x0',
  },
  {
    address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    blockHash: '0xe925a75cbef9557387e4bd779368c4fd92110ad04dfedb02bd9dccff1b18714e',
    blockNumber: '0x93fb1b',
    data: '0x00000000000000000000000000000000000000000000000029a2241af62c0000',
    logIndex: '0x3',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000009ea007843318b9ecd85f93ecc55d4e19143f007a',
    ],
    transactionHash: '0xf952e531124430b930711c5141e9bb2cecb0d02d7acc9a56e6c9d2ec07d10e5e',
    transactionIndex: '0x6',
  },
  {
    address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    blockHash: '0x95a57a56fa0d9eb339488f4bad4692aa700e5b0b776dc4e7e9e9cecdf9a7adc8',
    blockNumber: '0x93fb20',
    data: '0x00000000000000000000000000000000000000000000000029a2241af62c0000',
    logIndex: '0x3',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000009ea007843318b9ecd85f93ecc55d4e19143f007a',
    ],
    transactionHash: '0x6ff36e2263c99c7032453d7b0818f8b55bccf6d75716f8c51ff12e4045450cdd',
    transactionIndex: '0x5',
  },
  {
    address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    blockHash: '0xf78aa7c3dab5670670cd4a950ab58e122dc2d99c40e616ca12ebdfd0eb552240',
    blockNumber: '0x94141c',
    data: '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
    logIndex: '0x7',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000006d7f0754ffeb405d23c51ce938289d4835be3b14',
    ],
    transactionHash: '0x8b2e6ff71d33319af76244ca3abf883bb59ada0d4ca0ee6ca52eb1c799c191a5',
    transactionIndex: '0x6',
  },
  {
    address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    blockHash: '0x90fa1ff383f9f8da47b47f66c1936bb6b95f7c60ea1e013f1d6ace66d3b144a6',
    blockNumber: '0x94143d',
    data: '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
    logIndex: '0x1',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000006d7f0754ffeb405d23c51ce938289d4835be3b14',
    ],
    transactionHash: '0x43381ea704cfd1d962234f227aa7249495f4ea47789074b6a33a525ee1f5abbe',
    transactionIndex: '0x1',
  },
  {
    address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    blockHash: '0xb0b7c58ceaecfd624f2f7bab2df399ab7bc1bf04d2e8312f12fc6dab6d46f900',
    blockNumber: '0x954eac',
    data: '0x0000000000000000000000000000000000000000000000004563918244f40000',
    logIndex: '0x4',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000006d7f0754ffeb405d23c51ce938289d4835be3b14',
    ],
    transactionHash: '0x342756188896eefc89df0d848abab6fc2444c85eaec7e6d7fa0890ace110b1f0',
    transactionIndex: '0x5',
  },
  {
    address: '0x35560e108233ffdd022a4a398b41f33d21d16525',
    blockHash: '0xef4f6893e76b246cffe8d181cd828d295a79a4dc9b1ce0e60871f7a9569c0c9f',
    blockNumber: '0x95fe3b',
    data: '0x',
    logIndex: '0x16',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000000000000000000000000003',
    ],
    transactionHash: '0x234791bd655b874dadc19ed239938f08e4feb494438d7124e51c66f0c23a2d55',
    transactionIndex: '0xd',
  },
  {
    address: '0x35560e108233ffdd022a4a398b41f33d21d16525',
    blockHash: '0x6e07fe7e95daa3fe7ac3df4601da9b6e91283e70232174bda0660cb692f0848e',
    blockNumber: '0x95fe4a',
    data: '0x',
    logIndex: '0x1b',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000000000000000000000000003',
    ],
    transactionHash: '0x64314f6b471b8d740ff0063e63c03936f0d291ce86499fa36b322a0b5be8a3eb',
    transactionIndex: '0x9',
  },
  {
    address: '0x35560e108233ffdd022a4a398b41f33d21d16525',
    blockHash: '0xd848627e9c473c9b82eb8ec86f31f414d35be85a695e420307fe69819508f76a',
    blockNumber: '0x95febf',
    data: '0x',
    logIndex: '0x4',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000000000000000000000000003',
    ],
    transactionHash: '0xdc9730797b37f14f23e288aa6333e02ba7a86985f385ac2fec31eed10d17533f',
    transactionIndex: '0x7',
  },
  {
    address: '0xc778417e063141139fce010982780140aa0cd5ab',
    blockHash: '0x0188501960e29c61c3b3e7f9ce831f239e5c16d9b2abb435ede6efa4f886c371',
    blockNumber: '0x9643d5',
    data: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    logIndex: '0x2',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x000000000000000000000000c92e8bdf79f0507f65a392b0ab4667716bfe0110',
    ],
    transactionHash: '0x3aa97308046d6f0c8ea08ba9fdd52fb7aec014bc0156cece04d3ce57917879c1',
    transactionIndex: '0x2',
  },
  {
    address: '0xc778417e063141139fce010982780140aa0cd5ab',
    blockHash: '0x54f9153eb07297ce3fc419c861b31454856161066fd831676c2295a3e72afe01',
    blockNumber: '0x979106',
    data: '0x00000000000000000000000000000000000000000000000006f05b59d3b20000',
    logIndex: '0x10',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x000000000000000000000000c5e586be8c2ae78dfbebc41cb9232f652a837330',
    ],
    transactionHash: '0xc1dc598f365737216f07960976a5ab9dea3c128b36763a87d08f45699dc22217',
    transactionIndex: '0x5',
  },
  {
    address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    blockHash: '0x54f9153eb07297ce3fc419c861b31454856161066fd831676c2295a3e72afe01',
    blockNumber: '0x979106',
    data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
    logIndex: '0x11',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x000000000000000000000000c5e586be8c2ae78dfbebc41cb9232f652a837330',
    ],
    transactionHash: '0xc1dc598f365737216f07960976a5ab9dea3c128b36763a87d08f45699dc22217',
    transactionIndex: '0x5',
  },
  {
    address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    blockHash: '0xb20a2251a23a0b3fb8c6c19943979b1e728bc30ebcf86b77354d0199585e9ff3',
    blockNumber: '0x97a81f',
    data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
    logIndex: '0x14',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000006d7f0754ffeb405d23c51ce938289d4835be3b14',
    ],
    transactionHash: '0xed5d95e4c1749922c9b2e68a126e8078896c30de3820dee681453a5b2d25ce5b',
    transactionIndex: '0xf',
  },
  {
    address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    blockHash: '0xcf17e1947166b34bdf30e4bf96d8f7ca844534b28bcc36ab0a7ad67b8e386cd2',
    blockNumber: '0x982746',
    data: '0x0000000000000000000000000000000000000000000000004563918244f40000',
    logIndex: '0xd',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000006d7f0754ffeb405d23c51ce938289d4835be3b14',
    ],
    transactionHash: '0x91a0ef9ea2725fc45cc98fff17df9ac012604efc9de7c97bc6fd2455e54a67ff',
    transactionIndex: '0xb',
  },
  {
    address: '0x35560e108233ffdd022a4a398b41f33d21d16525',
    blockHash: '0xa1fe7f2398393b8b93da6577bc870a0ac2c7c846c81deaaf7f08f953c88c2ab9',
    blockNumber: '0x983dfe',
    data: '0x',
    logIndex: '0x81',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000000000000000000000000003',
    ],
    transactionHash: '0x495589ca5bc19b8a40330f73cc4de35f2ac3be8548e97df1313618171682a2ca',
    transactionIndex: '0xe',
  },
  {
    address: '0xc5e586be8c2ae78dfbebc41cb9232f652a837330',
    blockHash: '0x373a39c816ba610a3f23876f2f623fedd69dc46e7b73395b91e569d915ed934b',
    blockNumber: '0x984657',
    data: '0x',
    logIndex: '0x22',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x00000000000000000000000000000000000000000000000000000000000000ff',
    ],
    transactionHash: '0x55794cd90032c1677305ca7f6d64f7345782b5c42af11243d33dc3ccb16b85cb',
    transactionIndex: '0xd',
  },
  {
    address: '0xc5e586be8c2ae78dfbebc41cb9232f652a837330',
    blockHash: '0x373a39c816ba610a3f23876f2f623fedd69dc46e7b73395b91e569d915ed934b',
    blockNumber: '0x984657',
    data: '0x',
    logIndex: '0x24',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000000000000000000000000102',
    ],
    transactionHash: '0x55794cd90032c1677305ca7f6d64f7345782b5c42af11243d33dc3ccb16b85cb',
    transactionIndex: '0xd',
  },
  {
    address: '0x3c990b4b572f45cfe93c648cb7fef0ed52d5c5c3',
    blockHash: '0x373a39c816ba610a3f23876f2f623fedd69dc46e7b73395b91e569d915ed934b',
    blockNumber: '0x984657',
    data: '0x',
    logIndex: '0x26',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x000000000000000000000000000000000000000000000000000000000000109e',
    ],
    transactionHash: '0x55794cd90032c1677305ca7f6d64f7345782b5c42af11243d33dc3ccb16b85cb',
    transactionIndex: '0xd',
  },
  {
    address: '0x35560e108233ffdd022a4a398b41f33d21d16525',
    blockHash: '0x373a39c816ba610a3f23876f2f623fedd69dc46e7b73395b91e569d915ed934b',
    blockNumber: '0x984657',
    data: '0x',
    logIndex: '0x28',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000000000000000000000000003',
    ],
    transactionHash: '0x55794cd90032c1677305ca7f6d64f7345782b5c42af11243d33dc3ccb16b85cb',
    transactionIndex: '0xd',
  },
  {
    address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    blockHash: '0xb9ff91baafb379e46718a5717c45d376cbd7ceacd370a01de0313b3df2537759',
    blockNumber: '0x986fd9',
    data: '0x000000000000000000000000000000000000000000000001158e460913cfffff',
    logIndex: '0xb',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000006d7f0754ffeb405d23c51ce938289d4835be3b14',
    ],
    transactionHash: '0x87a7da20d056b7db91c849b032f9ec15f57327cc84c726b73ed029263f4d6a49',
    transactionIndex: '0x12',
  },
  {
    address: '0x35560e108233ffdd022a4a398b41f33d21d16525',
    blockHash: '0x02488437b48885e284cf918702b80ed188983ad5fb99406245d15d852fc3c1fc',
    blockNumber: '0x9a0447',
    data: '0x',
    logIndex: '0x6',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000000000000000000000000003',
    ],
    transactionHash: '0xae5f3a83024fb21d01d4ea035b9a827c7acc0c839561eb07af795be7817d0766',
    transactionIndex: '0xe',
  },
  {
    address: '0x68ac7d256668ae74730b17b32b1b8359c0de6ffa',
    blockHash: '0x869f262676fcc240bc3b718450f3424b39e475c0b7e831fcad7528cb1e7bf309',
    blockNumber: '0x9b33e9',
    data: '0x0000000000000000000000000000000000000000000000000000000000000000',
    logIndex: '0xd',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000008082a2fefc36fef1eafa164b1f723c319a3e911e',
    ],
    transactionHash: '0x58b01d3ac5527ab2150dda7ab9a9281eec416647ac4a288c472796b78d367091',
    transactionIndex: '0xb',
  },
  {
    address: '0x68ac7d256668ae74730b17b32b1b8359c0de6ffa',
    blockHash: '0xc1ac48e553bb2f18c47c39c64d293d4f564db853422535de239f2713d2a8fece',
    blockNumber: '0x9b34e9',
    data: '0x0000000000000000000000000000000000000000000000000000000000000000',
    logIndex: '0xf',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000008082a2fefc36fef1eafa164b1f723c319a3e911e',
    ],
    transactionHash: '0xd45d7ab401ae3cb27b3a04d6f3ece2101836ef88ee50e040201de5e15e63b04c',
    transactionIndex: '0xf',
  },
  {
    address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
    blockHash: '0x42c73c0c38de34c5d1d7ccf65459d3b0697895b2636bc79e6cdfda894e52ff61',
    blockNumber: '0x9e3c93',
    data: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    logIndex: '0x17',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x000000000000000000000000e6a282cb974e8f86bf67198d65e9c1da2d23b40d',
    ],
    transactionHash: '0xd3992aa71e20b71ddd1ab8f1b50b7764a6a571099625248bcaebda82c4888150',
    transactionIndex: '0x9',
  },
  {
    address: '0x3c990b4b572f45cfe93c648cb7fef0ed52d5c5c3',
    blockHash: '0x1d0055378f531b6e14bf0a9b868227deffc400c8c3007a87861b4055a57ae314',
    blockNumber: '0x9e5208',
    data: '0x',
    logIndex: '0x2e',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x000000000000000000000000000000000000000000000000000000000000109e',
    ],
    transactionHash: '0x0b4285f62ec9370d9c394ad523c4e00893b3fc39b9b841aeed51081d91b23c11',
    transactionIndex: '0x1c',
  },
  {
    address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
    blockHash: '0x0b310c3cc1ff9bbce7252099a8edbaadb6da2f959cbce7793914568a1129839e',
    blockNumber: '0xa286fe',
    data: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    logIndex: '0x4f',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x00000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc45',
    ],
    transactionHash: '0x7acaa0d2c53363627707ba039b85a72a64083f1325597fb0d7791aeb9d09e255',
    transactionIndex: '0x25',
  },
  {
    address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
    blockHash: '0x87016afc316d3ed78b3cfd00e1dbc438876227cfdd6612978d5dbd0fdfb52df2',
    blockNumber: '0xa28704',
    data: '0x000000000000000000000000000000000000000000000000000000003b8b87c0',
    logIndex: '0x5e',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x00000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc45',
    ],
    transactionHash: '0x8c4b141e5403a46de44447b4532535848e512b01b86618dcc9b1c386264c7948',
    transactionIndex: '0x1f',
  },
  {
    address: '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735',
    blockHash: '0x4404cbaad7e8d1c0cad3aaca63ea61544e02e06b83a9693a777831f7043d713b',
    blockNumber: '0xa28719',
    data: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    logIndex: '0x21',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x00000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc45',
    ],
    transactionHash: '0xd0174d284073b92474c30a54e402fa8d91c8885e6b0988670bf4aaa4de7e4029',
    transactionIndex: '0x14',
  },
  {
    address: '0x35560e108233ffdd022a4a398b41f33d21d16525',
    blockHash: '0x51efb0c78919775ec22cf62ca100da5fe3db5088f5ee7b803fd0f19a632abcc7',
    blockNumber: '0xa2a065',
    data: '0x',
    logIndex: '0x8',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000000000000000000000000003',
    ],
    transactionHash: '0xb8bb871f76452421ccaca86d771bbb876c6e923d505eee57bab9affe00764630',
    transactionIndex: '0x6',
  },
  {
    address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
    blockHash: '0xb6e28afe0021dfbe891a259d77770cae4f5f0d180549569eb767a11ac15dc191',
    blockNumber: '0xa2c88e',
    data: '0x000000000000000000000000000000000000000000000000000000003b9aca00',
    logIndex: '0x2c',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x000000000000000000000000f24c444322cfa1dba24509d25f7a337d4080eb15',
    ],
    transactionHash: '0xadda52d3e297082598e11f720d5579563ef053d5ef3ab7e9389a0a68c9cb920f',
    transactionIndex: '0x10',
  },
  {
    address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
    blockHash: '0xae9b345c539877179c72c8c316375be9bf728a870e1e93be32a5df6188ea6798',
    blockNumber: '0xa2c9ba',
    data: '0x0000000000000000000000000000000000000000000000000000000059682f00',
    logIndex: '0x1d',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x000000000000000000000000f24c444322cfa1dba24509d25f7a337d4080eb15',
    ],
    transactionHash: '0x09ed274f10a8112f4b6dd89d632cb51ebade5850c1014edfc7da948a0e2a9ae4',
    transactionIndex: '0xc',
  },
  {
    address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
    blockHash: '0x7600221df755d60f697ed7ec446781b1f5a916dc66bc5a213608765a4eacdc32',
    blockNumber: '0xa2c9fa',
    data: '0x000000000000000000000000000000000000000000000000000000001dcd6500',
    logIndex: '0x1b',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x000000000000000000000000f24c444322cfa1dba24509d25f7a337d4080eb15',
    ],
    transactionHash: '0x0b27c7ef902d85f847c4b22fcce8a2b14289a2aa75bd1502160b7ed644aa5af4',
    transactionIndex: '0xd',
  },
  {
    address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
    blockHash: '0x0bc3b112dc03a9d40ef1645864a1ebcf1158af6672e30e9e6968d886c870def0',
    blockNumber: '0xa2ca04',
    data: '0x000000000000000000000000000000000000000000000000000000001dcd6500',
    logIndex: '0x38',
    removed: false,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      '0x00000000000000000000000091db860c37e83dab0a4a005e209577e64c61eefa',
      '0x000000000000000000000000f24c444322cfa1dba24509d25f7a337d4080eb15',
    ],
    transactionHash: '0xf546962e45754b478318457bf50ca580beb6aeddf5558eb0c55e94cdc684c69c',
    transactionIndex: '0x11',
  },
];
