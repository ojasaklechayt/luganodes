import { provider } from '../../../utils/ethers';
import { ethers } from 'ethers'; // Make sure ethers is imported for utilities

const MAX_LOGS = 100; // Number of logs to fetch

async function fetchWithRetry(fn, retries = 3) {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0 && error.code === 429) {
            console.warn('Rate limit exceeded, retrying...');
            await new Promise(res => setTimeout(res, 2000)); // 2 seconds delay
            return fetchWithRetry(fn, retries - 1);
        }
        throw error;
    }
}

export async function GET() {
    try {
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        const filter = {
            address: contractAddress,
            fromBlock: 'latest', // Adjust the block range as needed
            toBlock: 'latest',
            topics: [], // Add filter topics if needed
        };

        // Fetch logs with retry logic
        const allLogs = await fetchWithRetry(() => provider.getLogs(filter));

        // Limit to the top MAX_LOGS logs
        const logs = allLogs.slice(0, MAX_LOGS);

        // Fetch block details for each log to get the timestamp and other details
        const deposits = await Promise.all(logs.map(async (log) => {
            const block = await provider.getBlock(log.blockNumber); // Fetch block info for timestamp
            const transaction = await provider.getTransaction(log.transactionHash); // Fetch transaction to get gas details
            const receipt = await provider.getTransactionReceipt(log.transactionHash); // To calculate fee

            const fee = ethers.formatEther(transaction.gasPrice * receipt.gasUsed); // Calculate fee in Ether
            let pubkey = log.address;
            
            try {
                const decodedData = ethers.DefaultAbiCoder.decode(["bytes"], log.address);
                pubkey = decodedData[0] ? decodedData[0].slice(0, 66) : 'N/A'; // Assuming pubkey is a 64-byte string
            } catch (error) {
                console.warn('Failed to decode log data:', error);
            }
            return {
                blockNumber: log.blockNumber,
                blockTimestamp: new Date(block.timestamp * 1000).toISOString(), // Convert timestamp to ISO string
                fee, // Gas fee in Ether
                hash: log.transactionHash,
                pubkey: pubkey.slice(0, 66) // Assuming pubkey is a 64-byte string in log data
            };
        }));

        return new Response(JSON.stringify(deposits), { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
