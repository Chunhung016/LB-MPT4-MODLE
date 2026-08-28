import { useParentAccount } from '../context/ParentAccountContext';

export interface DeviceAccessState {
  activationCode: string | null;
  spellingBeeEnabled: boolean;
  aiFeaturesEnabled: boolean;
  beeTokens: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDeviceAccess(): DeviceAccessState {
  const { access, loading, error, refresh } = useParentAccount();
  return {
    activationCode: access.activationCode,
    spellingBeeEnabled: access.spellingBeeEnabled,
    aiFeaturesEnabled: access.aiFeaturesEnabled,
    beeTokens: access.beeTokens,
    loading,
    error,
    refresh,
  };
}
