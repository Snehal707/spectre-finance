import { useState, useCallback, useRef } from "react";
import {
  createCofheClient,
  createCofheConfig,
} from "@cofhe/sdk/web";
import {
  Encryptable,
  FheTypes,
  isCofheError,
} from "@cofhe/sdk";
import { chains } from "@cofhe/sdk/chains";
import { Ethers6Adapter } from "@cofhe/sdk/adapters";
import { getEthersProvider, getEthersSigner } from "../utils/ethers";

// Keep the existing result shape so current callers remain unchanged.
interface CofheResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface EncryptedInputPayload {
  ctHash: bigint;
  securityZone: number;
  utype: number;
  signature: string;
}

interface EncryptionState {
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
}

export function useCofhe() {
  const [state, setState] = useState<EncryptionState>({
    isInitialized: false,
    isInitializing: false,
    error: null,
  });

  const clientRef = useRef<ReturnType<typeof createCofheClient> | null>(null);
  const initPromiseRef = useRef<Promise<boolean> | null>(null);
  const lastPermitRef = useRef<{ issuer?: string } | null>(null);

  // Initialize CoFHE SDK
  const initialize = useCallback(async (): Promise<boolean> => {
    // Return existing promise if already initializing
    if (initPromiseRef.current) {
      return initPromiseRef.current;
    }

    // Already initialized
    if (state.isInitialized && clientRef.current) {
      return true;
    }

    setState((prev) => ({ ...prev, isInitializing: true, error: null }));

    initPromiseRef.current = (async () => {
      try {
        const provider = await getEthersProvider();
        const signer = await getEthersSigner();
        const { publicClient, walletClient } = await Ethers6Adapter(
          provider,
          signer
        );

        const config = createCofheConfig({
          supportedChains: [chains.sepolia],
        });
        const client = createCofheClient(config);

        await client.connect(publicClient, walletClient);

        clientRef.current = client;
        setState({
          isInitialized: true,
          isInitializing: false,
          error: null,
        });

        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "CoFHE initialization failed";
        console.error("CoFHE initialization failed:", err);
        setState({
          isInitialized: false,
          isInitializing: false,
          error: message,
        });
        return false;
      } finally {
        initPromiseRef.current = null;
      }
    })();

    return initPromiseRef.current;
  }, [state.isInitialized]);

  // Encrypt a value using CoFHE
  const encrypt = useCallback(
    async (
      value: bigint,
      type:
        | "uint8"
        | "uint16"
        | "uint32"
        | "uint64"
        | "uint128"
        | "uint256" = "uint128",
      onProgress?: (state: string) => void
    ): Promise<CofheResult<EncryptedInputPayload>> => {
      if (!clientRef.current) {
        const initialized = await initialize();
        if (!initialized) {
          return { success: false, error: "CoFHE not initialized" };
        }
      }

      try {
        if (type === "uint256") {
          return { success: false, error: `Unsupported type: ${type}` };
        }

        // Progress callback
        const logState = (step: unknown) => {
          onProgress?.(String(step));
        };

        const client = clientRef.current;
        if (!client) return { success: false, error: "CoFHE not initialized" };

        let encrypted;
        if (type === "uint8") {
          encrypted = await client
            .encryptInputs([Encryptable.uint8(value)])
            .onStep((step) => logState(step))
            .execute();
        } else if (type === "uint16") {
          encrypted = await client
            .encryptInputs([Encryptable.uint16(value)])
            .onStep((step) => logState(step))
            .execute();
        } else if (type === "uint32") {
          encrypted = await client
            .encryptInputs([Encryptable.uint32(value)])
            .onStep((step) => logState(step))
            .execute();
        } else if (type === "uint64") {
          encrypted = await client
            .encryptInputs([Encryptable.uint64(value)])
            .onStep((step) => logState(step))
            .execute();
        } else {
          encrypted = await client
            .encryptInputs([Encryptable.uint128(value)])
            .onStep((step) => logState(step))
            .execute();
        }

        if (!encrypted || encrypted[0] === undefined) {
          return { success: false, error: "Encryption failed" };
        }

        return { success: true, data: encrypted[0] };
      } catch (err: unknown) {
        const message = isCofheError(err)
          ? `${err.code}: ${err.message}`
          : err instanceof Error
          ? err.message
          : "Encryption failed";
        console.error("CoFHE encrypt failed:", err);
        return {
          success: false,
          error: message,
        };
      }
    },
    [initialize]
  );

  // Create (or reuse) a permit for unsealing
  const createPermit = useCallback(
    async (issuerAddress: string): Promise<CofheResult<unknown>> => {
      // Reuse existing permit for this issuer within the session
      if (
        lastPermitRef.current &&
        lastPermitRef.current.issuer &&
        lastPermitRef.current.issuer.toLowerCase() === issuerAddress.toLowerCase()
      ) {
        return { success: true, data: lastPermitRef.current };
      }

      if (!clientRef.current) {
        const initialized = await initialize();
        if (!initialized) {
          return { success: false, error: "CoFHE not initialized" };
        }
      }

      try {
        const client = clientRef.current;
        if (!client) return { success: false, error: "CoFHE not initialized" };

        // Prefer reuse; this prompts only when a permit does not exist.
        const permit = await client.permits.getOrCreateSelfPermit();
        lastPermitRef.current = {
          issuer: issuerAddress,
        };
        return { success: true, data: permit };
      } catch (err: unknown) {
        const message = isCofheError(err)
          ? `${err.code}: ${err.message}`
          : err instanceof Error
          ? err.message
          : "Permit creation failed";
        console.error("CoFHE permit failed:", err);
        return {
          success: false,
          error: message,
        };
      }
    },
    [initialize]
  );

  // Unseal (decrypt) an encrypted value
  const unseal = useCallback(
    async (
      encryptedValue: unknown,
      type:
        | "uint8"
        | "uint16"
        | "uint32"
        | "uint64"
        | "uint128"
        | "uint256" = "uint128",
      issuerAddress: string
    ): Promise<CofheResult<bigint>> => {
      if (!clientRef.current) {
        const initialized = await initialize();
        if (!initialized) {
          return { success: false, error: "CoFHE not initialized" };
        }
      }

      try {
        // Map type string to SDK FHE type.
        const typeMap: Record<string, FheTypes> = {
          uint8: FheTypes.Uint8,
          uint16: FheTypes.Uint16,
          uint32: FheTypes.Uint32,
          uint64: FheTypes.Uint64,
          uint128: FheTypes.Uint128,
          uint256: FheTypes.Uint256,
        };
        const fheType = typeMap[type];
        if (!fheType) {
          return { success: false, error: `Unsupported type: ${type}` };
        }

        // Ensure permit is available before decrypting.
        const permitResult = await createPermit(issuerAddress);
        if (!permitResult.success) {
          return { success: false, error: permitResult.error };
        }

        const client = clientRef.current;
        if (!client) return { success: false, error: "CoFHE not initialized" };
        const value = await client
          .decryptForView(encryptedValue as `0x${string}`, fheType)
          .execute();
        return { success: true, data: BigInt(value) };
      } catch (err: unknown) {
        const message = isCofheError(err)
          ? `${err.code}: ${err.message}`
          : err instanceof Error
          ? err.message
          : "Unsealing failed";
        console.error("CoFHE unseal failed:", err);
        return {
          success: false,
          error: message,
        };
      }
    },
    [initialize, createPermit]
  );

  return {
    ...state,
    initialize,
    encrypt,
    createPermit,
    unseal,
    cofhe: clientRef.current,
  };
}
