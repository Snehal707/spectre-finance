import { useCallback, useMemo } from "react";
import { useAccount, useBalance, useDisconnect, useSwitchChain } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import { DEFAULT_NETWORK, getNetworkNameByChainId } from "../utils/config";

export function useWallet() {
  const { address, isConnected, chainId, status } = useAccount();
  const { data: balanceData, refetch: refetchBalance } = useBalance({ address });
  const { openConnectModal } = useConnectModal();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isCorrectNetwork = chainId === DEFAULT_NETWORK.chainId;

  const currentNetworkName = useMemo(
    () => getNetworkNameByChainId(chainId ?? null),
    [chainId]
  );

  const wallet = {
    address: address ?? null,
    isConnected,
    chainId: chainId ?? null,
    balance: balanceData
      ? Number(formatEther(balanceData.value)).toFixed(4)
      : "0",
  };

  const connect = useCallback(() => {
    if (openConnectModal) openConnectModal();
  }, [openConnectModal]);

  const disconnect = useCallback(() => {
    wagmiDisconnect();
  }, [wagmiDisconnect]);

  const fetchBalance = useCallback(async () => {
    await refetchBalance();
  }, [refetchBalance]);

  const switchNetwork = useCallback(async () => {
    switchChain({ chainId: DEFAULT_NETWORK.chainId });
  }, [switchChain]);

  return {
    wallet,
    isConnecting: status === "connecting" || status === "reconnecting",
    isCorrectNetwork,
    currentNetworkName,
    connect,
    disconnect,
    switchNetwork,
    fetchBalance,
  };
}
