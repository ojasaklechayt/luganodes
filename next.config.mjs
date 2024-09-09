/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        RPC_LINK: process.env.RPC_LINK,
        Contract_Address: process.env.Contract_Address,
        Contract_ABI: process.env.Contract_ABI,
        ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
    },
};

export default nextConfig;
