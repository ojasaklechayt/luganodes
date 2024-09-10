// utils/ethers.js
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.RPC_LINK);
const contractAddress = process.env.Contract_Address;
const contractABI = JSON.parse(process.env.Contract_ABI);

const contract = new ethers.Contract(contractAddress, contractABI, provider);

export { provider, contract };