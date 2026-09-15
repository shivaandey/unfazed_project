import axiosInstance from '../api/axiosInstance';

export const useEntitlement = () => {
  const canAccess = async (featureKey, templateType) => {
    const response = await axiosInstance.get('/entitlements/check', { params: { featureKey, templateType } });
    return response.data.allowed;
  };

  return { canAccess };
};