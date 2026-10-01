import axios from "axios";

export const getTokenUsdRate = async (
  mintAddress: string
): Promise<number | undefined> => {
  const response = await axios.get(
    `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`
  );
  return response?.data?.pairs?.[0]?.priceUsd
    ? parseFloat(response?.data?.pairs?.[0]?.priceUsd)
    : undefined;
};
