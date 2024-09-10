// Import the provider from a custom utility module and ethers.js functions for formatting and decoding
import { provider } from '../../../utils/ethers';
import { formatEther, getAbiCoder } from 'ethers'; // Direct imports from ethers.js v6

// Define a constant for the maximum number of logs to fetch
const MAX_LOGS = 100; // Number of logs to fetch

/**
 * Function to fetch data with retry logic in case of rate limits or errors.
 * @param {Function} fn - The function to fetch data.
 * @param {number} retries - The number of retry attempts.
 * @returns {Promise<any>} - The result of the fetch operation.
 */
async function fetchWithRetry(fn, retries = 3) {
    try {
        // Attempt to execute the function and return its result
        return await fn();
    } catch (error) {
        // Check if there are remaining retries and if the error is due to rate limiting
        if (retries > 0 && error.code === 'RESOURCE_EXHAUSTED') { // Updated error code for rate limiting
            console.warn('Rate limit exceeded, retrying...');
            // Wait for 2 seconds before retrying
            await new Promise(res => setTimeout(res, 2000));
            // Recursively retry the fetch function with one less retry attempt
            return fetchWithRetry(fn, retries - 1);
        }
        // If no retries left or different error, throw the error
        throw error;
    }
}

/**
 * Handler function to process GET requests and fetch Ethereum logs and details.
 * @returns {Response} - JSON response with deposit data or error information.
 */
export async function GET() {
    try {
        // Get the contract address from environment variables
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        // Define filter options for fetching logs
        const filter = {
            address: contractAddress, // Smart contract address to filter logs
            fromBlock: 'latest', // Start block (latest for recent logs)
            toBlock: 'latest', // End block (latest for recent logs)
            topics: [], // Event topics for filtering logs (e.g., deposit event signature)
        };

        // Fetch logs with retry logic
        const allLogs = await fetchWithRetry(() => provider.getLogs(filter));

        // Limit the results to the top MAX_LOGS logs
        const logs = allLogs.slice(0, MAX_LOGS);

        // Fetch detailed information for each log
        const deposits = await Promise.all(logs.map(async (log) => {
            // Fetch block information for the log to get the timestamp
            const block = await provider.getBlock(log.blockNumber);
            // Fetch transaction information to get gas details
            const transaction = await provider.getTransaction(log.transactionHash);
            // Fetch transaction receipt to calculate the gas fee
            const receipt = await provider.getTransactionReceipt(log.transactionHash);

            // Calculate the transaction fee in Ether
            const fee = formatEther((transaction.maxFeePerGas || transaction.gasPrice) * receipt.gasUsed);

            // Decode the log data to extract the deposit amount
            let depositAmount;
            try {
                const decodedData = getAbiCoder().decode(["uint256"], log.data);
                depositAmount = formatEther(decodedData[0]);
            } catch (error) {
                console.warn('Failed to decode log data:', error);
                depositAmount = 'N/A'; // Set deposit amount to 'N/A' if decoding fails
            }

            // Return an object with the log and transaction details
            return {
                blockNumber: log.blockNumber,
                blockTimestamp: new Date(block.timestamp * 1000).toISOString(), // Convert timestamp to ISO string
                fee, // Gas fee in Ether
                hash: log.transactionHash, // Transaction hash
                depositAmount, // Amount deposited to the contract
                pubkey: log.topics[1] ? log.topics[1] : 'N/A', // Assuming pubkey is in the log topics
            };
        }));

        // Return the deposit data as a JSON response with a 200 status
        return new Response(JSON.stringify(deposits), { status: 200 });
    } catch (error) {
        // Log and return an error response in case of failure
        console.error("Error: ", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
