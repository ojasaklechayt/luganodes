"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Link from "next/link";

const formatEther = (value) => ethers.formatEther(value);

export function Component() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const formatGwei = (value) => value ? parseFloat(ethers.formatUnits(value, "gwei")).toFixed(2) : "0.00";

  const fetchTransactions = async () => {
    const BASE_URL = 'https://api.etherscan.io/api';
    const API_KEY = process.env.ETHERSCAN_API_KEY;
    const contractAddress = process.env.Contract_Address;

    const txListUrl = `${BASE_URL}?module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${API_KEY}`;
    const internalTxListUrl = `${BASE_URL}?module=account&action=txlistinternal&address=${contractAddress}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${API_KEY}`;

    try {
      const [txListResponse, internalTxListResponse] = await Promise.all([
        fetch(txListUrl),
        fetch(internalTxListUrl),
      ]);

      const txListData = await txListResponse.json();
      const internalTxListData = await internalTxListResponse.json();

      if (txListData.status === '1' && internalTxListData.status === '1') {
        const transactions = [
          ...txListData.result,
          ...internalTxListData.result,
        ];

        console.log(transactions);

        // Sort by timeStamp in descending order and slice the latest 10 transactions
        const latestTransactions = transactions
          .sort((a, b) => b.timeStamp - a.timeStamp)
          .slice(0, 10);

        setTransactions(latestTransactions);
        setLoading(false);
      } else {
        console.error('Error fetching transactions:', txListData.message || internalTxListData.message);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // Fetch transactions every 30 seconds
    const interval = setInterval(() => {
      fetchTransactions();
    }, 10000);

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
                      {new Date(transaction.timeStamp * 1000).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-black">
                      {formatEther(transaction.value)} ETH
                    </td>
                    <td className="py-3 px-4 text-right text-black">{formatGwei(transaction.gasPrice)} Gwei</td>
                    <td className="py-3 px-4 text-black">
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
