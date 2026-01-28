import { useState, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import type { Eip1193Provider } from 'ethers';

// CoFHE SDK types
interface CofheResult<T> {
  success: boolean;
  data?: T;
  error?: string;
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
  
  const cofheRef = useRef<any>(null);
  const initPromiseRef = useRef<Promise<boolean> | null>(null);

  // Initialize CoFHE SDK
  const initialize = useCallback(async (): Promise<boolean> => {
    // Return existing promise if already initializing
    if (initPromiseRef.current) {
      return initPromiseRef.current;
    }

    // Already initialized
    if (state.isInitialized && cofheRef.current) {
      return true;
    }

    // Check for wallet
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: 'No wallet found' }));
      return false;
    }

    setState(prev => ({ ...prev, isInitializing: true, error: null }));

    initPromiseRef.current = (async () => {
      try {
        // Dynamic import for browser
        // @ts-ignore - cofhejs types not available
        const { cofhejs } = await import('cofhejs');
        
        const provider = new ethers.BrowserProvider(window.ethereum as Eip1193Provider);
        const signer = await provider.getSigner();

        console.log('🔐 Initializing CoFHE on Sepolia...');
        
        const initResult = await cofhejs.initializeWithEthers({
          ethersProvider: provider,
          ethersSigner: signer,
          environment: 'TESTNET',
        });

        if (!initResult.success) {
          throw new Error(initResult.error || 'CoFHE initialization failed');
        }

        cofheRef.current = cofhejs;
        setState({
          isInitialized: true,
          isInitializing: false,
          error: null,
        });

        console.log('✅ CoFHE initialized successfully!');
        return true;
      } catch (err: any) {
        console.error('❌ CoFHE initialization failed:', err);
        setState({
          isInitialized: false,
          isInitializing: false,
          error: err.message || 'CoFHE initialization failed',
        });
        return false;
      } finally {
        initPromiseRef.current = null;
      }
    })();

    return initPromiseRef.current;
  }, [state.isInitialized]);

  // Encrypt a value using CoFHE
  const encrypt = useCallback(async (
    value: bigint,
    type: 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint256' = 'uint128',
    onProgress?: (state: string) => void
  ): Promise<CofheResult<any>> => {
    if (!cofheRef.current) {
      const initialized = await initialize();
      if (!initialized) {
        return { success: false, error: 'CoFHE not initialized' };
      }
    }

    try {
      // @ts-ignore - cofhejs types not available
      const { Encryptable, FheTypes } = await import('cofhejs');
      
      // Map type string to FheTypes and Encryptable methods
      const typeMap: Record<string, { fheType: any; encryptFn: (v: bigint) => any }> = {
        uint8: { fheType: FheTypes.Uint8, encryptFn: Encryptable.uint8 },
        uint16: { fheType: FheTypes.Uint16, encryptFn: Encryptable.uint16 },
        uint32: { fheType: FheTypes.Uint32, encryptFn: Encryptable.uint32 },
        uint64: { fheType: FheTypes.Uint64, encryptFn: Encryptable.uint64 },
        uint128: { fheType: FheTypes.Uint128, encryptFn: Encryptable.uint128 },
        uint256: { fheType: FheTypes.Uint256, encryptFn: Encryptable.uint256 },
      };

      const { encryptFn } = typeMap[type];
      
      // Progress callback
      const logState = (encState: string) => {
        console.log(`🔒 Encryption state: ${encState}`);
        onProgress?.(encState);
      };

      console.log(`🔐 Encrypting value ${value} as ${type}...`);
      
      const encryptResult = await cofheRef.current.encrypt(
        [encryptFn(value)],
        logState
      );

      if (!encryptResult.success) {
        return { success: false, error: encryptResult.error || 'Encryption failed' };
      }

      console.log('✅ Encryption successful!');
      return { success: true, data: encryptResult.data[0] };
    } catch (err: any) {
      console.error('❌ Encryption error:', err);
      return { success: false, error: err.message || 'Encryption failed' };
    }
  }, [initialize]);

  // Create a permit for unsealing
  const createPermit = useCallback(async (
    issuerAddress: string
  ): Promise<CofheResult<any>> => {
    if (!cofheRef.current) {
      const initialized = await initialize();
      if (!initialized) {
        return { success: false, error: 'CoFHE not initialized' };
      }
    }

    try {
      console.log('📜 Creating permit for address:', issuerAddress);
      
      const permitResult = await cofheRef.current.createPermit({
        type: 'self',
        issuer: issuerAddress,
      });

      if (!permitResult.success) {
        return { success: false, error: permitResult.error || 'Permit creation failed' };
      }

      console.log('✅ Permit created successfully!');
      return { success: true, data: permitResult.data };
    } catch (err: any) {
      console.error('❌ Permit creation error:', err);
      return { success: false, error: err.message || 'Permit creation failed' };
    }
  }, [initialize]);

  // Unseal (decrypt) an encrypted value
  const unseal = useCallback(async (
    encryptedValue: any,
    type: 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint256' = 'uint128',
    issuerAddress: string
  ): Promise<CofheResult<bigint>> => {
    if (!cofheRef.current) {
      const initialized = await initialize();
      if (!initialized) {
        return { success: false, error: 'CoFHE not initialized' };
      }
    }

    try {
      // @ts-ignore - cofhejs types not available
      const { FheTypes } = await import('cofhejs');
      
      // Map type string to FheTypes
      const typeMap: Record<string, any> = {
        uint8: FheTypes.Uint8,
        uint16: FheTypes.Uint16,
        uint32: FheTypes.Uint32,
        uint64: FheTypes.Uint64,
        uint128: FheTypes.Uint128,
        uint256: FheTypes.Uint256,
      };

      // First create a permit
      const permitResult = await createPermit(issuerAddress);
      if (!permitResult.success) {
        return { success: false, error: permitResult.error };
      }

      const permit = permitResult.data;
      
      console.log('🔓 Unsealing encrypted value...');
      
      const unsealResult = await cofheRef.current.unseal(
        encryptedValue,
        typeMap[type],
        permit.issuer,
        permit.getHash()
      );

      if (!unsealResult.success) {
        return { success: false, error: unsealResult.error || 'Unsealing failed' };
      }

      console.log('✅ Unseal successful! Value:', unsealResult.data.toString());
      return { success: true, data: unsealResult.data };
    } catch (err: any) {
      console.error('❌ Unseal error:', err);
      return { success: false, error: err.message || 'Unsealing failed' };
    }
  }, [initialize, createPermit]);

  return {
    ...state,
    initialize,
    encrypt,
    createPermit,
    unseal,
    cofhe: cofheRef.current,
  };
}
