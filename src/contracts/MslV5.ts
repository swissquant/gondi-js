import { Address, encodeFunctionData, Hash } from 'viem';

import { filterLogs, LoanV5, OfferV5, RenegotiationV5, Wallet, zeroHash } from '@/blockchain';
import { getContracts } from '@/deploys';
import { multiSourceLoanABI as multiSourceLoanABIV5 } from '@/generated/blockchain/v5';
import { bpsToPercentage, getDomain, millisToSeconds } from '@/utils';

import { Contract } from './Contract';

export class MslV5 extends Contract<typeof multiSourceLoanABIV5> {
  constructor({ walletClient }: { walletClient: Wallet }) {
    const { MultiSourceLoanV5Address } = getContracts(walletClient.chain);

    super({
      walletClient,
      address: MultiSourceLoanV5Address,
      abi: multiSourceLoanABIV5,
    });
  }

  async signOffer({
    verifyingContract,
    structToSign,
  }: {
    verifyingContract: Address;
    structToSign: OfferV5;
  }) {
    return this.wallet.signTypedData({
      domain: getDomain(this.wallet.chain.id, verifyingContract),
      primaryType: 'LoanOffer',
      types: {
        LoanOffer: [
          { name: 'offerId', type: 'uint256' },
          { name: 'lender', type: 'address' },
          { name: 'fee', type: 'uint256' },
          { name: 'borrower', type: 'address' },
          { name: 'capacity', type: 'uint256' },
          { name: 'nftCollateralAddress', type: 'address' },
          { name: 'nftCollateralTokenId', type: 'uint256' },
          { name: 'principalAddress', type: 'address' },
          { name: 'principalAmount', type: 'uint256' },
          { name: 'aprBps', type: 'uint256' },
          { name: 'expirationTime', type: 'uint256' },
          { name: 'duration', type: 'uint256' },
          { name: 'validators', type: 'OfferValidator[]' },
        ],
        OfferValidator: [
          { name: 'validator', type: 'address' },
          { name: 'arguments', type: 'bytes' },
        ],
      },
      message: structToSign,
    });
  }

  async signRenegotiationOffer({
    verifyingContract,
    structToSign,
  }: {
    verifyingContract: Address;
    structToSign: RenegotiationV5;
  }) {
    return this.wallet.signTypedData({
      domain: getDomain(this.wallet.chain.id, verifyingContract),
      primaryType: 'RenegotiationOffer',
      types: {
        RenegotiationOffer: [
          { name: 'renegotiationId', type: 'uint256' },
          { name: 'loanId', type: 'uint256' },
          { name: 'lender', type: 'address' },
          { name: 'fee', type: 'uint256' },
          { name: 'targetPrincipal', type: 'uint256[]' },
          { name: 'principalAmount', type: 'uint256' },
          { name: 'aprBps', type: 'uint256' },
          { name: 'expirationTime', type: 'uint256' },
          { name: 'duration', type: 'uint256' },
        ],
      },
      message: structToSign,
    });
  }

  async cancelOffer({ id }: { id: bigint }) {
    const txHash = await this.safeContractWrite.cancelOffer([id]);
    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });

        const filter = await this.contract.createEventFilter.OfferCancelled();
        const events = filterLogs(receipt, filter);
        if (events.length === 0) throw new Error('Offer not cancelled');
        return { ...events[0].args, ...receipt };
      },
    };
  }

  async cancelAllOffers({ minId }: { minId: bigint }) {
    const txHash = await this.safeContractWrite.cancelAllOffers([minId]);

    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter = await this.contract.createEventFilter.AllOffersCancelled();
        const events = filterLogs(receipt, filter);
        if (events.length === 0) throw new Error('Offers not cancelled');
        return { ...events[0].args, ...receipt };
      },
    };
  }

  async cancelRefinanceOffer({ id }: { id: bigint }) {
    const txHash = await this.safeContractWrite.cancelRenegotiationOffer([id]);
    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter = await this.contract.createEventFilter.RenegotiationOfferCancelled();
        const events = filterLogs(receipt, filter);
        if (events.length === 0) throw new Error('Renegotiation offer not cancelled');
        return { ...events[0].args, ...receipt };
      },
    };
  }

  async cancelAllRenegotiations({ minId }: { minId: bigint }) {
    const txHash = await this.safeContractWrite.cancelAllRenegotiationOffers([minId]);
    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter = await this.contract.createEventFilter.AllRenegotiationOffersCancelled();
        const events = filterLogs(receipt, filter);
        if (events.length === 0) throw new Error('Renegotiation offers not cancelled');
        return { ...events[0].args, ...receipt };
      },
    };
  }

  private mapEmitLoanToMslArgs({
    offer,
    tokenId,
    amount,
    expirationTime,
    signature,
  }: Parameters<MslV5['emitLoan']>[0]) {
    const executionData = {
      offer,
      tokenId,
      amount,
      expirationTime,
      callbackData: '0x' as Hash, // No callback data is expected here, only for BNPL [Levearage call]
    };

    return {
      executionData,
      lender: offer.lender,
      borrower: this.wallet.account.address,
      lenderOfferSignature: signature,
      borrowerOfferSignature: '0x' as Hash, // No signature data is expected here, only for BNPL [Levearage call]
    };
  }

  async emitLoan(emitArgs: {
    offer: OfferV5;
    signature: Hash;
    tokenId: bigint;
    amount: bigint;
    expirationTime: bigint;
  }) {
    const emitLoanMslArgs = this.mapEmitLoanToMslArgs(emitArgs);
    const txHash = await this.safeContractWrite.emitLoan([emitLoanMslArgs]);

    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter = await this.contract.createEventFilter.LoanEmitted();
        const events = filterLogs(receipt, filter);
        if (events.length === 0) throw new Error('Loan not emitted');
        const args = events[0].args;
        const tx = await this.bcClient.getTransaction({ hash: txHash });
        console.log('tx', tx.hash);
        console.log(`SAMPLE
          MutableAttributeDict(
            {
                "args": AttributeDict(
                    {
                        "borrower": "${args.loan.borrower}",
                        "fee": ${args.fee},
                        "lender": "${args.loan.source[0].lender}",
                        "offerId": ${args.offerId},
                        "loanId": ${args.loanId},
                        "loan": AttributeDict(
                            {
                                "borrower": "${args.loan.borrower}",
                                "duration": ${args.loan.duration},
                                "nftCollateralAddress": "${args.loan.nftCollateralAddress}",
                                "nftCollateralTokenId": ${args.loan.nftCollateralTokenId},
                                "principalAddress": Currencies.WETH.value.address,
                                "principalAmount": ${args.loan.principalAmount},
                                "startTime": ${args.loan.startTime},
                                "source": [
                                    AttributeDict(
                                        {
                                            "aprBps": ${args.loan.source[0].aprBps},
                                            "accruedInterest": ${args.loan.source[0].accruedInterest},
                                            "lender": "${args.loan.source[0].lender}",
                                            "loanId": ${args.loan.source[0].loanId},
                                            "principalAmount": ${args.loan.source[0].principalAmount},
                                            "startTime": ${args.loan.source[0].startTime},
                                        }
                                    )
                                ],
                            }
                        ),
                    }
                ),
                "event": "LoanEmitted",
                "logIndex": 2,
                "transactionIndex": ${receipt.transactionIndex},
                "transactionHash": HexBytes(
                    "${receipt.transactionHash}"
                ),
                "address": MSL_ADDRESS_V5,
                "blockHash": HexBytes(
                    "${receipt.blockHash}"
                ),
                "blockNumber": ${receipt.blockNumber},
            }
        )
        `);
        console.log(`SAMPLE_TX
          MutableAttributeDict(
            {
                "hash": HexBytes(
                    "${receipt.transactionHash}"
                ),
                "nonce": ${tx.nonce},
                "blockHash": HexBytes(
                    "${receipt.blockHash}"
                ),
                "blockNumber": ${receipt.blockNumber},
                "transactionIndex": ${receipt.transactionIndex},
                "from": "${tx.from}",
                "to": MSL_ADDRESS_V5,
                "value": ${tx.value},
                "gasPrice": ${tx.gasPrice},
                "gas": ${tx.gas},
                "input": "ASD",
                "v": ${tx.v},
                "r": HexBytes(
                    "${tx.r}"
                ),
                "s": HexBytes(
                    "${tx.s}"
                ),
                "type": 2,
                "accessList": [],
                "maxPriorityFeePerGas": ${tx.maxPriorityFeePerGas},
                "maxFeePerGas": ${tx.maxFeePerGas},
                "chainId": ${tx.chainId},
            }
        )
        `);
        console.log(tx.input);
        return {
          loan: {
            id: `${this.contract.address.toLowerCase()}.${args.loanId}`,
            ...args.loan,
            contractAddress: this.contract.address,
          },
          loanId: args.loanId,
          offerId: `${this.contract.address.toLowerCase()}.${emitArgs.offer.lender.toLowerCase()}.${
            args.offerId
          }`,
          ...receipt,
        };
      },
    };
  }

  async revokeDelegationsAndEmitLoan({
    delegations,
    emit,
  }: {
    delegations: Address[];
    emit: Parameters<MslV5['emitLoan']>[0];
  }) {
    if (delegations.length === 0) throw new Error('At least one delegation must be revoked');

    const encodedRevokeDelegations = delegations.map((delegation) =>
      encodeFunctionData({
        abi: multiSourceLoanABIV5,
        functionName: 'revokeDelegate',
        args: [delegation, emit.offer.nftCollateralAddress, emit.tokenId],
      }),
    );

    const emitLoanMslArgs = this.mapEmitLoanToMslArgs(emit);
    const encodedEmitLoan = encodeFunctionData({
      abi: multiSourceLoanABIV5,
      functionName: 'emitLoan',
      args: [emitLoanMslArgs],
    });

    const txHash = await this.safeContractWrite.multicall([
      [...encodedRevokeDelegations, encodedEmitLoan],
    ]);

    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });

        const revokeFilter = await this.contract.createEventFilter.RevokeDelegate();
        const revokeEvents = filterLogs(receipt, revokeFilter);
        if (revokeEvents.length !== delegations.length)
          throw new Error('Revoke delegations failed');

        const emitFilter = await this.contract.createEventFilter.LoanEmitted();
        const emitEvents = filterLogs(receipt, emitFilter);
        if (emitEvents.length === 0) throw new Error('Loan not emitted');

        const results = [
          ...revokeEvents.map(({ args }) => args),
          ...emitEvents.map(({ args }) => args),
        ];
        const emitLoanArgs = emitEvents[0].args;
        return {
          loan: {
            id: `${this.contract.address.toLowerCase()}.${emitLoanArgs.loanId}`,
            ...emitLoanArgs.loan,
            contractAddress: this.contract.address,
          },
          loanId: emitLoanArgs.loanId,
          ...receipt,
          results,
        };
      },
    };
  }

  async repayLoan({ loan, loanId }: { loan: LoanV5; loanId: bigint }) {
    const signableRepaymentData = {
      loanId,
      callbackData: '0x' as Hash, // No callback data is expected here, only for BNPL [Levearage call]
      shouldDelegate: false, // No need to delegate
    };
    const txHash = await this.safeContractWrite.repayLoan([
      {
        data: signableRepaymentData,
        loan,
        borrowerSignature: '0x', // No signature data is expected here, only for BNPL [Levearage call]
      },
    ]);
    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter = await this.contract.createEventFilter.LoanRepaid();
        const events = filterLogs(receipt, filter);
        if (events.length === 0) throw new Error("Loan not repaid");
        const args = events[0].args;
        console.log(`SAMPLE
          MutableAttributeDict(
            {
                "args": AttributeDict(
                    {
                        "loanId": ${args.loanId},
                        "totalRepayment": ${args.totalRepayment},
                        "fee": ${args.fee},
                    }
                ),
                "event": "LoanRefinanced",
                "logIndex": 2,
                "transactionIndex": ${receipt.transactionIndex},
                "transactionHash": HexBytes(
                    "${receipt.transactionHash}"
                ),
                "address": MSL_ADDRESS_V5,
                "blockHash": HexBytes(
                    "${receipt.blockHash}"
                ),
                "blockNumber": ${receipt.blockNumber},
            }
        )
        `);
        return { ...events[0].args, ...receipt };
      },
    };
  }

  async getRemainingLockupSeconds({ loan }: { loan: LoanV5 }) {
    const newestSource = loan.source[0];
    const loanEndDate = loan.startTime + loan.duration;
    const newestSourceDuration = loanEndDate - newestSource.startTime;

    const lockPeriodBps = await this.contract.read.getMinLockPeriod();
    const lockPercentage = bpsToPercentage(lockPeriodBps);

    const lockupTimeSeconds = Math.ceil(Number(newestSourceDuration) * lockPercentage);

    const ellapsedSeconds = Math.ceil(millisToSeconds(Date.now()) - Number(newestSource.startTime));

    if (ellapsedSeconds >= lockupTimeSeconds) return 0;
    return lockupTimeSeconds - ellapsedSeconds;
  }

  async refinanceFullLoan({
    offer,
    signature,
    loan,
  }: {
    offer: RenegotiationV5;
    signature: Hash;
    loan: LoanV5;
  }) {
    const txHash = await this.safeContractWrite.refinanceFull([offer, loan, signature]);

    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter = await this.contract.createEventFilter.LoanRefinanced();
        const events = filterLogs(receipt, filter);
        if (events.length === 0) throw new Error('Loan not refinanced');
        const args = events[0].args;
        return {
          loan: {
            id: `${this.contract.address.toLowerCase()}.${args.newLoanId}`,
            ...args.loan,
            contractAddress: this.contract.address,
          },
          renegotiationId: `${this.contract.address.toLowerCase()}.${offer.lender.toLowerCase()}.${
            args.renegotiationId
          }`,
          ...receipt,
        };
      },
    };
  }

  async refinancePartialLoan({ offer, loan }: { offer: RenegotiationV5; loan: LoanV5 }) {
    const txHash = await this.safeContractWrite.refinancePartial([offer, loan]);
    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter = await this.contract.createEventFilter.LoanRefinanced();
        const events = filterLogs(receipt, filter);
        if (events.length === 0) throw new Error('Loan not refinanced');
        const args = events[0].args;
        const tx = await this.bcClient.getTransaction({ hash: txHash });
        console.log('tx', tx.hash);
        console.log(`SAMPLE
          MutableAttributeDict(
            {
                "args": AttributeDict(
                    {
                        "oldLoanId": ${args.oldLoanId},
                        "newLoanId": ${args.newLoanId},
                        "renegotiationId": ${args.renegotiationId},
                        "loan": AttributeDict(
                            {
                                "borrower": "${args.loan.borrower}",
                                "duration": ${args.loan.duration},
                                "nftCollateralAddress": "${args.loan.nftCollateralAddress}",
                                "nftCollateralTokenId": ${args.loan.nftCollateralTokenId},
                                "principalAddress": Currencies.WETH.value.address,
                                "principalAmount": ${args.loan.principalAmount},
                                "startTime": ${args.loan.startTime},
                                "source": [
                                    AttributeDict(
                                        {
                                            "aprBps": ${args.loan.source[0].aprBps},
                                            "accruedInterest": ${args.loan.source[0].accruedInterest},
                                            "lender": "${args.loan.source[0].lender}",
                                            "loanId": ${args.loan.source[0].loanId},
                                            "principalAmount": ${args.loan.source[0].principalAmount},
                                            "startTime": ${args.loan.source[0].startTime},
                                        }
                                    ),
                                    AttributeDict(
                                        {
                                            "aprBps": ${args.loan.source[1].aprBps},
                                            "accruedInterest": ${args.loan.source[1].accruedInterest},
                                            "lender": "${args.loan.source[1].lender}",
                                            "loanId": ${args.loan.source[1].loanId},
                                            "principalAmount": ${args.loan.source[1].principalAmount},
                                            "startTime": ${args.loan.source[1].startTime},
                                        }
                                    )
                                ],
                            }
                        ),
                        "fee": ${args.fee},
                    }
                ),
                "event": "LoanRefinanced",
                "logIndex": 2,
                "transactionIndex": ${receipt.transactionIndex},
                "transactionHash": HexBytes(
                    "${receipt.transactionHash}"
                ),
                "address": MSL_ADDRESS_V5,
                "blockHash": HexBytes(
                    "${receipt.blockHash}"
                ),
                "blockNumber": ${receipt.blockNumber},
            }
        )
        `);
        console.log(`SAMPLE_TX
          MutableAttributeDict(
            {
                "hash": HexBytes(
                    "${receipt.transactionHash}"
                ),
                "nonce": ${tx.nonce},
                "blockHash": HexBytes(
                    "${receipt.blockHash}"
                ),
                "blockNumber": ${receipt.blockNumber},
                "transactionIndex": ${receipt.transactionIndex},
                "from": "${tx.from}",
                "to": MSL_ADDRESS_V5,
                "value": ${tx.value},
                "gasPrice": ${tx.gasPrice},
                "gas": ${tx.gas},
                "input": "ASD",
                "v": ${tx.v},
                "r": HexBytes(
                    "${tx.r}"
                ),
                "s": HexBytes(
                    "${tx.s}"
                ),
                "type": 2,
                "accessList": [],
                "maxPriorityFeePerGas": ${tx.maxPriorityFeePerGas},
                "maxFeePerGas": ${tx.maxFeePerGas},
                "chainId": ${tx.chainId},
            }
        )
        `);
        console.log(tx.input);
        return {
          loan: {
            id: `${this.contract.address.toLowerCase()}.${args.newLoanId}`,
            ...args.loan,
            contractAddress: this.contract.address,
          },
          renegotiationId: `${this.contract.address.toLowerCase()}.${offer.lender.toLowerCase()}.${
            args.renegotiationId
          }`,
          ...receipt,
        };
      },
    };
  }

  async extendLoan({
    loan,
    loanId,
    newDuration,
  }: {
    loan: LoanV5;
    loanId: bigint;
    newDuration: bigint;
  }) {
    const txHash = await this.safeContractWrite.extendLoan([
      loanId,
      loan,
      newDuration - loan.duration,
    ]);

    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter = await this.contract.createEventFilter.LoanExtended();
        const events = filterLogs(receipt, filter);
        if (events.length === 0) throw new Error('Loan not extended');
        const args = events[0].args;
        return {
          loan: {
            id: `${this.contract.address.toLowerCase()}.${args.newLoanId}`,
            ...args.loan,
            contractAddress: this.contract.address,
          },
          newLoanId: args.newLoanId,
          ...receipt,
        };
      },
    };
  }

  async delegateMulticall(delegations: Parameters<MslV5['delegate']>[0][]) {
    if (delegations.length === 0) throw new Error('At least one delegation must be revoked');

    const txHash = await this.safeContractWrite.multicall([
      delegations.map((delegation) =>
        encodeFunctionData({
          abi: multiSourceLoanABIV5,
          functionName: 'delegate',
          args: [
            delegation.loanId,
            delegation.loan,
            delegation.to,
            delegation.rights ?? zeroHash,
            delegation.enable,
          ],
        }),
      ),
    ]);

    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter = await this.contract.createEventFilter.Delegated();
        const events = filterLogs(receipt, filter);

        if (events.length !== delegations.length) throw new Error('Delegate multicall failed');

        return {
          ...receipt,
          results: events.map(({ args }) => args),
        };
      },
    };
  }

  async delegate({
    loan,
    loanId,
    to,
    rights = zeroHash,
    enable,
  }: {
    loan: LoanV5;
    loanId: bigint;
    to: Address;
    rights?: Hash;
    enable: boolean;
  }) {
    const txHash = await this.safeContractWrite.delegate([loanId, loan, to, rights, enable]);

    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter = await this.contract.createEventFilter.Delegated();
        const events = filterLogs(receipt, filter);
        if (events.length === 0) throw new Error('Token not delegated');
        const args = events[0].args;
        return {
          loan: {
            ...loan,
            loanId,
            contractAddress: this.contract.address,
          },
          value: args.value,
          ...receipt,
        };
      },
    };
  }

  async revokeDelegate({
    to,
    collection,
    tokenId,
  }: {
    to: Address;
    collection: Address;
    tokenId: bigint;
  }) {
    const txHash = await this.safeContractWrite.revokeDelegate([to, collection, tokenId]);

    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filter = await this.contract.createEventFilter.RevokeDelegate();
        const events = filterLogs(receipt, filter);
        if (events.length === 0) throw new Error('Token delegation not revoked');
        const args = events[0].args;
        return { ...args, ...receipt };
      },
    };
  }

  async liquidateLoan({ loan, loanId }: { loan: LoanV5; loanId: bigint }) {
    const txHash = await this.safeContractWrite.liquidateLoan([loanId, loan]);
    return {
      txHash,
      waitTxInBlock: async () => {
        const receipt = await this.bcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const filterForeclosed = await this.contract.createEventFilter.LoanForeclosed();
        const filterSentToLiquidator = await this.contract.createEventFilter.LoanSentToLiquidator();
        const foreclosedEvents = filterLogs(receipt, filterForeclosed);
        const sentToLiquidatorEvents = filterLogs(receipt, filterSentToLiquidator);
        if (foreclosedEvents.length === 0 && sentToLiquidatorEvents.length === 0)
          throw new Error('Loan not liquidated');
        return {
          ...(foreclosedEvents?.[0]?.args ?? sentToLiquidatorEvents?.[0]?.args),
          ...receipt,
        };
      },
    };
  }
}
