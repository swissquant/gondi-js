import { Address, Chain, Hash, isAddress, zeroAddress } from "viem";
import { goerli } from "viem/chains";

const ANVIL_CHAIN_ID = 31337;

interface Contracts {
  MultiSourceLoanV4Address: Address;
  MultiSourceLoanV5Address: Address;
  MultiSourceLoanV5_1Address: Address;
  AuctionLoanLiquidatorV4Address: Address;
  AuctionLoanLiquidatorV5Address: Address;
  LeverageAddressV1: Address;
  LeverageAddressV1_1: Address;
  SeaportAddress: Address;
  CryptoPunksAddress: Address;
}

interface ApiKeys {
  reservoirApiKey: string;
  infuraApiKey: string;
}

interface Currencies {
  WETH_ADDRESS: Address;
  ETH_ADDRESS: Address;
  USDC_ADDRESS: Address;
}

const ensureAddress = (value: string | undefined): Address | null => {
  if (!value || !isAddress(value)) {
    return null;
  }
  return value;
};

export const MSL_V5_TX_HASH =
  "0xb6dfcbc1661d0c0bced9591d06e964f97d41a35984704ffe61f8e062e43919c8" as Hash;

export const getContracts = (chain: Pick<Chain, "id">): Contracts => {
  if (chain?.id === ANVIL_CHAIN_ID) {
    return {
      MultiSourceLoanV4Address:
        ensureAddress(process.env.GONDI_MULTI_SOURCE_LOAN_V4) ??
        "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
      MultiSourceLoanV5Address:
        ensureAddress(process.env.GONDI_MULTI_SOURCE_LOAN_V5) ??
        "0x68B1D87F95878fE05B998F19b66F4baba5De1aed",
      MultiSourceLoanV5_1Address:
        ensureAddress(process.env.GONDI_MULTI_SOURCE_LOAN_V5_1) ??
        "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
      AuctionLoanLiquidatorV4Address:
        ensureAddress(process.env.GONDI_AUCTION_LOAN_LIQUIDATOR_V4) ??
        "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
      AuctionLoanLiquidatorV5Address:
        ensureAddress(process.env.GONDI_AUCTION_LOAN_LIQUIDATOR_V5) ??
        "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE",
      LeverageAddressV1:
        ensureAddress(process.env.GONDI_LEVERAGE) ??
        "0xBe6Eb4ACB499f992ba2DaC7CAD59d56DA9e0D823",
      LeverageAddressV1_1:
        ensureAddress(process.env.GONDI_LEVERAGE_V1_1) ??
        "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
      SeaportAddress:
        ensureAddress(process.env.SEAPORT) ??
        "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC",
      CryptoPunksAddress:
        ensureAddress(process.env.CRYPTO_PUNKS) ??
        "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
    };
  }

  if (chain?.id === goerli.id) {
    return {
      MultiSourceLoanV4Address: "0x60C20627429668F267b5cF55c6605c665C69887D",
      MultiSourceLoanV5Address: "0xTODO", // TODO: deploy
      MultiSourceLoanV5_1Address: "0xTODO", // TODO: deploy
      AuctionLoanLiquidatorV4Address:
        "0x29C73faa2f9180ea5a7B0bEC243ebc63a5B4f280",
      AuctionLoanLiquidatorV5Address: "0xTODO", // TODO: deploy
      LeverageAddressV1: "0xTODO", // TODO: deploy
      LeverageAddressV1_1: "0xTODO", // TODO: deploy
      SeaportAddress: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC",
      CryptoPunksAddress: "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
    };
  }

  return {
    MultiSourceLoanV4Address: "0xCa5a494Ca20483e21ec1E41FE1D9461Da77595Bd",
    MultiSourceLoanV5Address: "0x478f6F994C6fb3cf3e444a489b3AD9edB8cCaE16",
    MultiSourceLoanV5_1Address: "0x52cdce4ebd1c6045765e4399ed2e4fffb9bf7e54",
    AuctionLoanLiquidatorV4Address:
      "0x237e4421C742d843Fdd96D22294D338507e17091",
    AuctionLoanLiquidatorV5Address:
      "0x97d34635b605c2f1630d6b4c6c5d222b8a2ca47d",
    LeverageAddressV1: "0x87Ce6e8124fFd68fa721FcC7f35fdA14A11E233e",
    LeverageAddressV1_1: "0x13df570de8465f5319b6a2c60de21716400074e7",
    SeaportAddress: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC",
    CryptoPunksAddress: "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
  };
};

export const getApiKeys = (): ApiKeys => ({
  reservoirApiKey: "5b472f8c-b471-531a-a450-56e428e5a00a",
  infuraApiKey: "9b7006cb0b0b42f1813ae9418741fbb5",
});

export const getCurrencies = (): Currencies => ({
  WETH_ADDRESS: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  ETH_ADDRESS: zeroAddress,
  USDC_ADDRESS: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
});
