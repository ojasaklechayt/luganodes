'use client';
import { useEffect, useState } from 'react';

export default function Comp() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [depositsPerPage] = useState(10);

  useEffect(() => {
    let intervalId;

    async function fetchDeposits() {
      try {
        const response = await fetch('/api/trackDeposits');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setDeposits(data);
      } catch (error) {
        console.error('Error fetching deposits:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDeposits(); // Initial fetch

    intervalId = setInterval(() => {
      fetchDeposits(); // Refresh data every 10 seconds
    }, 10000); // 10000 ms = 10 seconds

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // Calculate the index of the first and last deposits for the current page
  const indexOfLastDeposit = currentPage * depositsPerPage;
  const indexOfFirstDeposit = indexOfLastDeposit - depositsPerPage;
  const currentDeposits = deposits.slice(indexOfFirstDeposit, indexOfLastDeposit);

  // Handle pagination
  const totalPages = Math.ceil(deposits.length / depositsPerPage);
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-background dark:bg-card-foreground">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Ethereum Transactions Tracker
      </h1>
      {loading ? (
        <p className="text-white">Loading transactions...</p>
      ) : (
        <div className="bg-card rounded-lg shadow-md overflow-hidden dark:bg-background">
          <table className="w-full table-auto">
            <thead className="bg-muted dark:bg-muted-foreground">
              <tr>
                <th className="py-3 px-4 text-left text-black">Block</th>
                <th className="py-3 px-4 text-left text-black">Timestamp</th>
                <th className="py-3 px-4 text-left text-black">Transaction</th>
                <th className="py-3 px-4 text-left text-black">Fee</th>
                <th className="py-3 px-4 text-left text-black">Public Key</th>
              </tr>
            </thead>
            <tbody>
              {currentDeposits.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-3 px-4 text-center text-black">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                currentDeposits.map((deposit, index) => (
                  <tr
                    key={index}
                    className={`border-b ${index % 2 === 0 ? "bg-card dark:bg-background" : "bg-card-foreground dark:bg-muted"
                      }`}
                  >
                    <td className="py-3 px-4 text-black">
                      {deposit.blockNumber}
                    </td>
                    <td className="py-3 px-4 text-black">
                      {new Date(deposit.blockTimestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-black">
                      {deposit.hash.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4 text-black">
                      {deposit.fee.slice(0,7)} ETH
                    </td>
                    <td className="py-3 px-4 text-black">
                      {deposit.pubkey.slice(0, 8)}...{deposit.pubkey.slice(-8)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button
              className="px-4 py-2 bg-gray-800 text-white"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-4 py-2 bg-gray-800 text-white"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
