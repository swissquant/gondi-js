export const cryptopunksABI = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    type: "function",
    stateMutability: "view",
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    name: "punksOfferedForSale",
    outputs: [
      {
        name: "isForSale",
        type: "bool",
      },
      {
        name: "punkIndex",
        type: "uint256",
      },
      {
        name: "seller",
        type: "address",
      },
      {
        name: "minValue",
        type: "uint256",
      },
      {
        name: "onlySellTo",
        type: "address",
      },
    ],
    payable: false,
    type: "function",
    stateMutability: "view",
  },
  {
    constant: false,
    inputs: [
      {
        name: "punkIndex",
        type: "uint256",
      },
    ],
    name: "enterBidForPunk",
    outputs: [],
    payable: true,
    type: "function",
    stateMutability: "payable",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    type: "function",
    stateMutability: "view",
  },
  {
    constant: false,
    inputs: [
      {
        name: "punkIndex",
        type: "uint256",
      },
      {
        name: "minPrice",
        type: "uint256",
      },
    ],
    name: "acceptBidForPunk",
    outputs: [],
    payable: false,
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "",
        type: "uint8",
      },
    ],
    payable: false,
    type: "function",
    stateMutability: "view",
  },
  {
    constant: false,
    inputs: [
      {
        name: "addresses",
        type: "address[]",
      },
      {
        name: "indices",
        type: "uint256[]",
      },
    ],
    name: "setInitialOwners",
    outputs: [],
    payable: false,
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    constant: false,
    inputs: [],
    name: "withdraw",
    outputs: [],
    payable: false,
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    constant: true,
    inputs: [],
    name: "imageHash",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    type: "function",
    stateMutability: "view",
  },
  {
    constant: true,
    inputs: [],
    name: "nextPunkIndexToAssign",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    type: "function",
    stateMutability: "view",
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    name: "punkIndexToAddress",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    payable: false,
    type: "function",
    stateMutability: "view",
  },
  {
    constant: true,
    inputs: [],
    name: "standard",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    type: "function",
    stateMutability: "view",
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    name: "punkBids",
    outputs: [
      {
        name: "hasBid",
        type: "bool",
      },
      {
        name: "punkIndex",
        type: "uint256",
      },
      {
        name: "bidder",
        type: "address",
      },
      {
        name: "value",
        type: "uint256",
      },
    ],
    payable: false,
    type: "function",
    stateMutability: "view",
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    type: "function",
    stateMutability: "view",
  },
  {
    constant: false,
    inputs: [],
    name: "allInitialOwnersAssigned",
    outputs: [],
    payable: false,
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    constant: true,
    inputs: [],
    name: "allPunksAssigned",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    type: "function",
    stateMutability: "view",
  },
  {
    constant: false,
    inputs: [
      {
        name: "punkIndex",
        type: "uint256",
      },
    ],
    name: "buyPunk",
    outputs: [],
    payable: true,
    type: "function",
    stateMutability: "payable",
  },
  {
    constant: false,
    inputs: [
      {
        name: "to",
        type: "address",
      },
      {
        name: "punkIndex",
        type: "uint256",
      },
    ],
    name: "transferPunk",
    outputs: [],
    payable: false,
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    type: "function",
    stateMutability: "view",
  },
  {
    constant: false,
    inputs: [
      {
        name: "punkIndex",
        type: "uint256",
      },
    ],
    name: "withdrawBidForPunk",
    outputs: [],
    payable: false,
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    constant: false,
    inputs: [
      {
        name: "to",
        type: "address",
      },
      {
        name: "punkIndex",
        type: "uint256",
      },
    ],
    name: "setInitialOwner",
    outputs: [],
    payable: false,
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    constant: false,
    inputs: [
      {
        name: "punkIndex",
        type: "uint256",
      },
      {
        name: "minSalePriceInWei",
        type: "uint256",
      },
      {
        name: "toAddress",
        type: "address",
      },
    ],
    name: "offerPunkForSaleToAddress",
    outputs: [],
    payable: false,
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    constant: true,
    inputs: [],
    name: "punksRemainingToAssign",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    type: "function",
    stateMutability: "view",
  },
  {
    constant: false,
    inputs: [
      {
        name: "punkIndex",
        type: "uint256",
      },
      {
        name: "minSalePriceInWei",
        type: "uint256",
      },
    ],
    name: "offerPunkForSale",
    outputs: [],
    payable: false,
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    constant: false,
    inputs: [
      {
        name: "punkIndex",
        type: "uint256",
      },
    ],
    name: "getPunk",
    outputs: [],
    payable: false,
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address",
      },
    ],
    name: "pendingWithdrawals",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    type: "function",
    stateMutability: "view",
  },
  {
    constant: false,
    inputs: [
      {
        name: "punkIndex",
        type: "uint256",
      },
    ],
    name: "punkNoLongerForSale",
    outputs: [],
    payable: false,
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    inputs: [],
    payable: true,
    type: "constructor",
    stateMutability: "payable",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        name: "punkIndex",
        type: "uint256",
      },
    ],
    name: "Assign",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        name: "punkIndex",
        type: "uint256",
      },
    ],
    name: "PunkTransfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "punkIndex",
        type: "uint256",
      },
      {
        indexed: false,
        name: "minValue",
        type: "uint256",
      },
      {
        indexed: true,
        name: "toAddress",
        type: "address",
      },
    ],
    name: "PunkOffered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "punkIndex",
        type: "uint256",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
      {
        indexed: true,
        name: "fromAddress",
        type: "address",
      },
    ],
    name: "PunkBidEntered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "punkIndex",
        type: "uint256",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
      {
        indexed: true,
        name: "fromAddress",
        type: "address",
      },
    ],
    name: "PunkBidWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "punkIndex",
        type: "uint256",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
      {
        indexed: true,
        name: "fromAddress",
        type: "address",
      },
      {
        indexed: true,
        name: "toAddress",
        type: "address",
      },
    ],
    name: "PunkBought",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "punkIndex",
        type: "uint256",
      },
    ],
    name: "PunkNoLongerForSale",
    type: "event",
  },
] as const;
