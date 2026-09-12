import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const FEATURE_CONFIG = {
  'active-client-cap': { starter: true, pro: true },
  'analytics-depth': { starter: false, pro: true },
  'note-template-type': { starter: true, pro: true },
  chat: { starter: true, pro: true },
  branding: { starter: false, pro: true }
};

export const useEntitlement = () => {
  const { user } = useContext(AuthContext);

  const canAccess = (featureKey, tier = user?.tier || 'starter') => {
    const feature = FEATURE_CONFIG[featureKey] || {};
    return feature[tier] ?? true;
  };

  return { canAccess };
};