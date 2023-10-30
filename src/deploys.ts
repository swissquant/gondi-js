import { Address, Chain, zeroAddress } from "viem";
import { goerli } from "viem/chains";

const ANVIL_CHAIN_ID = 31337;

interface Contracts {
  MultiSourceLoanV4Address: Address;
  MultiSourceLoanV5Address: Address;
  AuctionLoanLiquidatorV4Address: Address;
  AuctionLoanLiquidatorV5Address: Address;
  LeverageAddress: Address;
  SeaportAddress: Address;
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

export const getContracts = (chain: Pick<Chain, "id">): Contracts => {
  if (chain?.id === ANVIL_CHAIN_ID) {
    return {
      MultiSourceLoanV4Address: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
      MultiSourceLoanV5Address: "0x68B1D87F95878fE05B998F19b66F4baba5De1aed",
      AuctionLoanLiquidatorV4Address:
        "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
      AuctionLoanLiquidatorV5Address:
        "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE",
      LeverageAddress: "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d",
      SeaportAddress: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC",
    };
  }

  if (chain?.id === goerli.id) {
    return {
      MultiSourceLoanV4Address: "0x60C20627429668F267b5cF55c6605c665C69887D",
      MultiSourceLoanV5Address: "0xTODO", // TODO: deploy
      AuctionLoanLiquidatorV4Address:
        "0x29C73faa2f9180ea5a7B0bEC243ebc63a5B4f280",
      AuctionLoanLiquidatorV5Address: "0xTODO", // TODO: deploy
      LeverageAddress: "0xTODO", // TODO: deploy
      SeaportAddress: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC",
    };
  }

  return {
    MultiSourceLoanV4Address: "0xCa5a494Ca20483e21ec1E41FE1D9461Da77595Bd",
    MultiSourceLoanV5Address: "0xTODO", // TODO: deploy
    AuctionLoanLiquidatorV4Address:
      "0x237e4421C742d843Fdd96D22294D338507e17091",
    AuctionLoanLiquidatorV5Address: "0xTODO", // TODO: deploy
    LeverageAddress: "0xTODO", // TODO: deploy
    SeaportAddress: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC",
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