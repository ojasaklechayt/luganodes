// 'use client' directive to indicate that this file is a client-side component in Next.js
'use client'
import { useState, useEffect } from "react"; // Importing React hooks for managing state and side effects
import { ethers } from "ethers"; // Importing ethers.js library for Ethereum functionalities
import Link from "next/link"; // Importing Link component from Next.js for client-side navigation

// Function to format values from Wei to Ether
const formatEther = (value) => ethers.formatEther(value);

// Main functional component for displaying Ethereum transactions
export function Component() {
  // State to hold the list of transactions
  const [transactions, setTransactions] = useState([]);
  // State to manage loading status
  const [loading, setLoading] = useState(true);
  
  // Function to format gas price values from Wei to Gwei
  const formatGwei = (value) => value ? parseFloat(ethers.formatUnits(value, "gwei")).toFixed(2) : "0.00";

  // Asynchronous function to fetch transactions from Etherscan API
  const fetchTransactions = async () => {
    const BASE_URL = 'https://api.etherscan.io/api'; // Base URL for Etherscan API
    const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY; // API key for Etherscan (from environment variables)
    const contractAddress = process.env.Contract_Address; // Contract address (from environment variables)

    // Construct URLs for fetching transaction and internal transaction lists
    const txListUrl = `${BASE_URL}?module=account&action=txlist&address=0x00000000219ab540356cBB839Cbe05303d7705Fa&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
    const internalTxListUrl = `${BASE_URL}?module=account&action=txlistinternal&address=0x00000000219ab540356cBB839Cbe05303d7705Fa&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${ETHERSCAN_API_KEY}`;

    try {
      // Fetch both transaction and internal transaction lists concurrently
      const [txListResponse, internalTxListResponse] = await Promise.all([
        fetch(txListUrl),
        fetch(internalTxListUrl),
      ]);

      // Parse the responses as JSON
      const txListData = await txListResponse.json();
      const internalTxListData = await internalTxListResponse.json();

      // Check if the responses are successful
      if (txListData.status === '1' && internalTxListData.status === '1') {
        // Combine transaction and internal transaction results
        const transactions = [
          ...txListData.result,
          ...internalTxListData.result,
        ];

        // Log transactions for debugging
        console.log(transactions);

        // Sort transactions by timestamp in descending order and get the latest 10
        const latestTransactions = transactions
          .sort((a, b) => b.timeStamp - a.timeStamp)
          .slice(0, 10);

        // Update state with the latest transactions and set loading to false
        setTransactions(latestTransactions);
        setLoading(false);
      } else {
        // Log errors if fetching transactions fails
        console.error('Error fetching transactions:', txListData.message || internalTxListData.message);
        setLoading(false);
      }
    } catch (error) {
      // Log errors if there's an issue with fetching transactions
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  // Use effect hook to fetch transactions on component mount and set up polling
  useEffect(() => {
    // Fetch transactions initially
    fetchTransactions();
    // Set up polling to fetch transactions every 10 seconds
    const interval = setInterval(() => {
      fetchTransactions();
    }, 10000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-background dark:bg-card-foreground">
      <h1 className="text-2xl font-bold mb-6 text-white">Ethereum Transactions Tracker</h1>
      {loading ? (
        <p className="text-white">Loading transactions...</p>
      ) : (
        <div className="bg-card rounded-lg shadow-md overflow-hidden dark:bg-background">
          <table className="w-full table-auto">
            <thead className="bg-muted dark:bg-muted-foreground">
              <tr>
                <th className="py-3 px-4 text-left text-black">Block</th>
                <th className="py-3 px-4 text-left text-black">Timestamp</th>
                <th className="py-3 px-4 text-right text-black">Amount</th>
                <th className="py-3 px-4 text-right text-black">Fee</th>
                <th className="py-3 px-4 text-left text-black">Transaction</th>
                <th className="py-3 px-4 text-left text-black">Pubkey</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-3 px-4 text-center text-black">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, index) => (
                  <tr
                    key={index}
                    className={`border-b ${index % 2 === 0 ? "bg-card dark:bg-background" : "bg-card-foreground dark:bg-muted"
                      }`}
                  >
                    <td className="py-3 px-4 text-black">
                      {/* Link to the block on Etherscan */}
                      <Link
                        href={`https://etherscan.io/block/${transaction.blockNumber}`}
                        target="_blank"
                        className="text-primary hover:underline"
                        prefetch={false}
                      >
                        {transaction.blockNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-black">
                      {/* Convert timestamp to local date and time */}
                      {new Date(transaction.timeStamp * 1000).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-black">
                      {/* Format and display the transaction value in Ether */}
                      {formatEther(transaction.value)} ETH
                    </td>
                    <td className="py-3 px-4 text-right text-black">
                      {/* Format and display the gas price in Gwei */}
                      {formatGwei(transaction.gasPrice)} Gwei
                    </td>
                    <td className="py-3 px-4 text-black">
                      {/* Link to the transaction on Etherscan */}
                      <Link
                        href={`https://etherscan.io/tx/${transaction.hash}`}
                        target="_blank"
                        className="text-primary hover:underline"
                        prefetch={false}
                      >
                        {transaction.hash.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-black">
                      {/* Link to the sender's address on Etherscan */}
                      <Link
                        href={`https://etherscan.io/address/${transaction.from}`}
                        target="_blank"
                        className="text-primary hover:underline"
                        prefetch={false}
                      >
                        {transaction.from.slice(0, 8)}...
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
