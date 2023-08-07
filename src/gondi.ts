import {
  Address,
  Chain,
  createPublicClient,
  createTransport,
  isAddress,
  PublicClient,
  Transport,
} from "viem";

import {
  filterLogs,
  Contracts,
  zeroAddress,
  zeroHash,
  zeroHex,
  Wallet,
} from "@/blockchain";
import {
  MarketplaceEnum,
  OffersSortField,
  Ordering,
} from "@/generated/graphql";

import { Api, Props as ApiProps } from "@/api";
import * as model from "@/model";

type GondiProps = {
  wallet: Wallet;
} & ApiProps;

export class Gondi {
  contracts: Contracts;
  wallet: Wallet;
  bcClient: PublicClient<Transport, Chain>;
  api: Api;

  constructor({ wallet, ...apiProps }: GondiProps) {
    this.wallet = wallet;
    this.bcClient = createPublicClient({
      transport: ({ chain: _chain }: { chain?: Chain }) =>
        createTransport(wallet.transport),
    });
    this.contracts = new Contracts(this.bcClient, wallet);
    this.api = new Api({ wallet, ...apiProps });
  }

  async makeSingleNftOffer(offer: model.SingleNftOfferInput) {
    const offerInput = {
      lenderAddress: await this.wallet.account?.address,
      signerAddress: await this.wallet.account?.address,
      borrowerAddress: offer.borrowerAddress ?? zeroAddress,
      contractAddress: this.contracts.MultiSourceLoan.address,
      offerValidators: [], // This is ignored by the API but it was required in the mutation
      ...offer,
    };
    const response = await this.api.generateSingleNftOfferHash({ offerInput });

    const {
      offerHash,
      offerId,
      validators,
      lenderAddress,
      signerAddress,
      borrowerAddress,
    } = response.offer;
    const collateralAddress =
      response.offer.nft.collection?.contractData?.contractAddress;

    if (collateralAddress === undefined) throw new Error("Invalid nft");

    const structToSign = {
      ...offerInput,
      lender: lenderAddress ?? offerInput.lenderAddress,
      signer: signerAddress ?? offerInput.signerAddress,
      borrower: borrowerAddress ?? offerInput.borrowerAddress,
      nftCollateralTokenId: response.offer.nft.tokenId,
      nftCollateralAddress: collateralAddress,
      validators,
      offerId,
    };

    const signature = await this.wallet.signTypedData({
      domain: this.getDomain(),
      primaryType: "LoanOffer",
      types: {
        LoanOffer: [
          { name: "offerId", type: "uint256" },
          { name: "lender", type: "address" },
          { name: "fee", type: "uint256" },
          { name: "borrower", type: "address" },
          { name: "capacity", type: "uint256" },
          { name: "signer", type: "address" },
          { name: "requiresLiquidation", type: "bool" },
          { name: "nftCollateralAddress", type: "address" },
          { name: "nftCollateralTokenId", type: "uint256" },
          { name: "principalAddress", type: "address" },
          { name: "principalAmount", type: "uint256" },
          { name: "aprBps", type: "uint256" },
          { name: "expirationTime", type: "uint256" },
          { name: "duration", type: "uint256" },
          { name: "validators", type: "OfferValidator[]" },
        ],
        OfferValidator: [
          { name: "validator", type: "address" },
          { name: "arguments", type: "bytes" },
        ],
      },
      message: structToSign,
    });

    const signedOffer = {
      ...offerInput,
      offerValidators: validators.map((validator) => ({
        arguments: validator.arguments,
        validator: validator.validator,
      })),
      offerHash: offerHash ?? zeroHash,
      offerId,
      signature,
    };
    return await this.api.saveSingleNftOffer(signedOffer);
  }

  async makeCollectionOffer(offer: model.CollectionOfferInput) {
    const offerInput = {
      lenderAddress: await this.wallet.account?.address,
      signerAddress: await this.wallet.account?.address,
      borrowerAddress: offer.borrowerAddress ?? zeroAddress,
      contractAddress: this.contracts.MultiSourceLoan.address,
      offerValidators: [
        // This is ignored by the API but it was required in the mutation
        {
          validator: zeroAddress,
          arguments: zeroHex,
        },
      ],
      ...offer,
    };
    const response = await this.api.generateCollectionOfferHash({ offerInput });
    const collateralAddress =
      response.offer.collection.contractData?.contractAddress;

    if (collateralAddress === undefined) throw new Error("Invalid collection");

    const {
      offerHash,
      offerId,
      validators,
      lenderAddress,
      signerAddress,
      borrowerAddress,
    } = response.offer;
    const structToSign = {
      ...offerInput,
      lender: lenderAddress ?? offerInput.lenderAddress,
      signer: signerAddress ?? offerInput.signerAddress,
      borrower: borrowerAddress ?? offerInput.borrowerAddress,
      nftCollateralTokenId: 0n,
      nftCollateralAddress: collateralAddress,
      validators,
      offerId,
    };

    const signature = await this.wallet.signTypedData({
      domain: this.getDomain(),
      primaryType: "LoanOffer",
      types: {
        LoanOffer: [
          { name: "offerId", type: "uint256" },
          { name: "lender", type: "address" },
          { name: "fee", type: "uint256" },
          { name: "borrower", type: "address" },
          { name: "capacity", type: "uint256" },
          { name: "signer", type: "address" },
          { name: "requiresLiquidation", type: "bool" },
          { name: "nftCollateralAddress", type: "address" },
          { name: "nftCollateralTokenId", type: "uint256" },
          { name: "principalAddress", type: "address" },
          { name: "principalAmount", type: "uint256" },
          { name: "aprBps", type: "uint256" },
          { name: "expirationTime", type: "uint256" },
          { name: "duration", type: "uint256" },
          { name: "validators", type: "OfferValidator[]" },
        ],
        OfferValidator: [
          { name: "validator", type: "address" },
          { name: "arguments", type: "bytes" },
        ],
      },
      message: structToSign,
    });

    const signedOffer = {
      ...offerInput,
      offerValidators: validators.map((validator) => ({
        arguments: validator.arguments,
        validator: validator.validator,
      })),
      offerHash: offerHash ?? zeroHash,
      offerId,
      signature,
    };
    return await this.api.saveCollectionOffer(signedOffer);
  }

  async cancelOffer({ id }: { id: string }) {
    const contractId = BigInt(id.split(".").at(-1) ?? "0");
    const txHash = await this.contracts.MultiSourceLoan.write.cancelOffer([
      this.wallet.account.address,
      contractId,
    ]);
    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter =
          await this.contracts.MultiSourceLoan.createEventFilter.OfferCancelled();
        const events = filterLogs(receipt, filter);
        if (events.length == 0) throw new Error("Offer not cancelled");
        return events[0].args;
      },
    };
  }

  async cancelAllOffers({ minId }: { minId: bigint; contract: string }) {
    const txHash = await this.contracts.MultiSourceLoan.write.cancelAllOffers([
      this.wallet.account.address,
      minId,
    ]);

    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter =
          await this.contracts.MultiSourceLoan.createEventFilter.AllOffersCancelled();
        const events = filterLogs(receipt, filter);
        if (events.length == 0) throw new Error("Offer not cancelled");
        return events[0].args;
      },
    };
  }

  async hideOffer({ id }: { id: string }) {
    const [contract, _lender, contractOfferId] = id.split(".");
    if (!isAddress(contract)) {
      throw new Error("invalid id");
    }
    this.api.hideOffer({ contract, id: contractOfferId });
  }

  async makeRefinanceOffer(
    renegotiation: model.RenegotiationInput,
    skipSignature?: boolean
  ) {
    const renegotiationInput = {
      lenderAddress: await this.wallet.account?.address,
      signerAddress: await this.wallet.account?.address,
      ...renegotiation,
    };
    const response = await this.api.generateRenegotiationOfferHash({
      renegotiationInput,
    });

    const { renegotiationId, offerHash, loanId, lenderAddress, signerAddress } =
      response.offer;
    const structToSign = {
      ...renegotiationInput,
      fee: renegotiationInput.feeAmount,
      lender: lenderAddress ?? renegotiationInput.lenderAddress,
      signer: signerAddress ?? renegotiationInput.signerAddress,
      strictImprovement: false,
      loanId: BigInt(loanId),
      renegotiationId,
    };

    if (skipSignature) {
      return {
        ...renegotiationInput,
        offerHash: offerHash ?? zeroHash,
        loanId: BigInt(loanId),
        renegotiationId,
      };
    }

    const signature = await this.wallet.signTypedData({
      domain: this.getDomain(),
      primaryType: "RenegotiationOffer",
      types: {
        RenegotiationOffer: [
          { name: "renegotiationId", type: "uint256" },
          { name: "loanId", type: "uint256" },
          { name: "lender", type: "address" },
          { name: "fee", type: "uint256" },
          { name: "signer", type: "address" },
          { name: "targetPrincipal", type: "uint256[]" },
          { name: "principalAmount", type: "uint256" },
          { name: "aprBps", type: "uint256" },
          { name: "expirationTime", type: "uint256" },
          { name: "duration", type: "uint256" },
          { name: "strictImprovement", type: "bool" },
        ],
      },
      message: structToSign,
    });

    const renegotiationOffer = {
      ...renegotiationInput,
      signature,
      offerHash: offerHash ?? zeroHash,
      renegotiationId,
    };
    await this.api.saveRefinanceOffer({ offer: renegotiationOffer });
    return { ...renegotiationOffer, loanId: BigInt(loanId) };
  }

  async cancelRenegotiation({ id }: { id: string }) {
    const contractId = BigInt(id.split(".").at(-1) ?? "0");
    const txHash =
      await this.contracts.MultiSourceLoan.write.cancelRenegotiationOffer([
        this.wallet.account.address,
        contractId,
      ]);
    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter =
          await this.contracts.MultiSourceLoan.createEventFilter.RenegotiationOfferCancelled();
        const events = filterLogs(receipt, filter);
        if (events.length == 0) throw new Error("Offer not cancelled");
        return events[0].args;
      },
    };
  }

  async hideRenegotiationOffer({ id }: { id: string }) {
    this.api.hideRenegotiationOffer({ id });
  }

  async cancelAllRenegotiations({
    minId,
  }: {
    minId: bigint;
    contract: string;
  }) {
    const txHash =
      await this.contracts.MultiSourceLoan.write.cancelAllRenegotiationOffers([
        this.wallet.account.address,
        minId,
      ]);
    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter =
          await this.contracts.MultiSourceLoan.createEventFilter.RenegotiationOfferCancelled();
        const events = filterLogs(receipt, filter);
        if (events.length == 0) throw new Error("Offer not cancelled");
        return events[0].args;
      },
    };
  }

  async emitLoan(
    offer: model.SingleNftOffer | model.CollectionOffer,
    tokenId: bigint
  ) {
    const contractOffer = {
      ...offer,
      lender: offer.lenderAddress,
      borrower: offer.borrowerAddress,
      signer: offer.signerAddress,
      validators: offer.offerValidators,
    };

    const txHash = await this.contracts.MultiSourceLoan.write.emitLoan([
      contractOffer,
      tokenId,
      offer.signature,
      false,
    ]);

    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter =
          await this.contracts.MultiSourceLoan.createEventFilter.LoanEmitted();
        const events = filterLogs(receipt, filter);
        if (events.length == 0) throw new Error("Loan not emitted");
        return events[0].args;
      },
    };
  }

  async repayLoan(loan: model.Loan, nftReceiver?: Address) {
    const receiver = nftReceiver ?? this.wallet.account.address;
    const txHash = await this.contracts.MultiSourceLoan.write.repayLoan([
      receiver,
      loan.source[0].loanId,
      loan,
      false,
    ]);

    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter =
          await this.contracts.MultiSourceLoan.createEventFilter.LoanRepaid();
        const events = filterLogs(receipt, filter);
        if (events.length == 0) throw new Error("Loan not repaid");
        return events[0].args;
      },
    };
  }

  async offers({
    limit = 20,
    cursor,
    sortBy = { field: OffersSortField.CreatedDate, order: Ordering.Desc },
    filterBy = {},
  }: model.ListOffersProps) {
    return await this.api.listOffers({
      first: limit,
      after: cursor,
      sortBy,
      ...filterBy,
    });
  }

  async list({ nft }: { nft: number }) {
    await this.api.listNft({ nftId: nft });
  }

  async unlist({ nft }: { nft: number }) {
    await this.api.unlistNft({ nftId: nft });
  }

  async listings({
    collections,
    user,
    marketPlaces = [MarketplaceEnum.Gondi],
    limit = 20,
    cursor,
  }: model.ListListingsProps) {
    const {
      result: { edges, pageInfo },
    } = await this.api.listListings({
      collections,
      userFilter: user,
      marketplaceNames: marketPlaces,
      after: cursor,
      first: limit,
    });
    return {
      cursor: pageInfo.endCursor,
      listings: edges.map((edge) => edge.node),
    };
  }

  async nftId(props: { slug: string; tokenId: bigint }) {
    const result = await this.api.nftId(props);
    if (!result?.nft) {
      throw new Error(`invalid nft ${props}`);
    }
    return Number(result.nft.id);
  }

  async collectionId(props: { slug: string }) {
    const result = await this.api.collectionId(props);
    if (!result?.collection) {
      throw new Error(`invalid collection ${props}`);
    }
    return Number(result.collection.id);
  }

  async refinanceFullLoan(offer: model.RenegotiationOffer, loan: model.Loan) {
    const offerInput = {
      ...offer,
      loanId: 0n,
      strictImprovement: offer.strictImprovement ?? false,
      lender: offer.lenderAddress,
      signer: offer.signerAddress,
      fee: offer.feeAmount,
      targetPrincipal: [offer.principalAmount],
    };

    const txHash = await this.contracts.MultiSourceLoan.write.refinanceFull([
      offerInput,
      loan,
      offer.signature,
    ]);

    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter =
          await this.contracts.MultiSourceLoan.createEventFilter.LoanRefinanced();
        const events = filterLogs(receipt, filter);
        if (events.length == 0) throw new Error("Loan not refinanced");
        return events[0].args;
      },
    };
  }

  async approveNFTForAll(nftAddress: Address) {
    const erc721 = this.contracts.ERC721(nftAddress);
    const MultiSourceLoanAddress = this.contracts.MultiSourceLoan.address;
    const txHash = await erc721.write.setApprovalForAll([
      MultiSourceLoanAddress,
      true,
    ]);

    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter = await erc721.createEventFilter.ApprovalForAll({});
        const events = filterLogs(receipt, filter);
        if (events.length == 0)
          throw new Error("ERC721 approval for all not set");
        return events[0].args;
      },
    };
  }

  async approveToken(tokenAddress: Address, amount: bigint = model.MAX_NUMBER) {
    const erc20 = this.contracts.ERC20(tokenAddress);
    const MultiSourceLoanAddress = this.contracts.MultiSourceLoan.address;
    const txHash = await erc20.write.approve([MultiSourceLoanAddress, amount]);

    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter = await erc20.createEventFilter.Approval({});
        const events = filterLogs(receipt, filter);
        if (events.length == 0) throw new Error("ERC20 approval not set");
        return events[0].args;
      },
    };
  }

  private getDomain() {
    return {
      name: "GONDI_MULTI_SOURCE_LOAN",
      version: "1",
      chainId: this.wallet.chain.id,
      verifyingContract: this.contracts.MultiSourceLoan.address,
    };
  }
}
