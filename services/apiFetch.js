export const apiFetch = async (endpoint, options = {}) => {
  const BASE_URL = "https://eventually-back.vercel.app/api/v1";

  const defaultOptions = {
    headers: {},
  };

  if (!(options.body instanceof FormData)) {
    defaultOptions.headers["Content-Type"] = "application/json";
  }

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, finalOptions);
    return response;
  } catch (error) {
    console.error("Error de fetch:", error);
    throw error;
  }
};
