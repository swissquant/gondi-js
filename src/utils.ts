import { Address } from "abitype";

import { getContracts } from "./deploys";

export const areSameAddress = (
  adr1: Address | null | undefined,
  adr2: Address | null | undefined
) => {
  return adr1 && adr2 && adr1.toLowerCase() === adr2.toLowerCase();
};

export const getDomain = (chainId: number, verifyingContract: Address) => {
  const contracts = getContracts({ id: chainId });
  const version = areSameAddress(verifyingContract, contracts.MultiSourceLoanV4Address) ? "1" : "2";
  return {
    name: "GONDI_MULTI_SOURCE_LOAN",
    version,
    chainId,
    verifyingContract,
  };
};

const toInteger = (bn: bigint | number): number => Number(bn.valueOf());

export const millisToSeconds = (millis: number | bigint) => Math.ceil(toInteger(millis) / 1_000);
export const SECONDS_IN_DAY = 60 * 60 * 24;