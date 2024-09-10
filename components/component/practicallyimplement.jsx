"use client"; // Indicates that this component should be rendered on the client side

import { useEffect, useState } from 'react';

export default function Comp() {
  // State to store the list of deposits fetched from the API
  const [deposits, setDeposits] = useState([]);
  // State to track the loading status of the data
  const [loading, setLoading] = useState(true);
  // State to manage the current page number for pagination
  const [currentPage, setCurrentPage] = useState(1);
  // Number of deposits to display per page
  const [depositsPerPage] = useState(10);

  useEffect(() => {
    let intervalId;

    // Function to fetch deposits from the API
    async function fetchDeposits() {
      try {
        // Fetch data from the API endpoint
        const response = await fetch('/api/trackDeposits');
        if (!response.ok) {
          throw new Error('Network response was not ok'); // Handle network errors
        }
        // Parse the JSON data from the response
        const data = await response.json();
        // Update state with the fetched data
        setDeposits(data);
      } catch (error) {
        // Log any errors that occur during the fetch
        console.error('Error fetching deposits:', error);
      } finally {
        // Update loading state to false once data is fetched or an error occurs
        setLoading(false);
      }
    }

    // Initial fetch of deposits
    fetchDeposits();

    // Set up an interval to refresh the deposits data every 10 seconds
    intervalId = setInterval(() => {
      fetchDeposits(); // Refresh data
    }, 10000); // 10000 ms = 10 seconds

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // Calculate the index of the first and last deposit for the current page
  const indexOfLastDeposit = currentPage * depositsPerPage;
  const indexOfFirstDeposit = indexOfLastDeposit - depositsPerPage;
  // Slice the deposits array to get only the deposits for the current page
  const currentDeposits = deposits.slice(indexOfFirstDeposit, indexOfLastDeposit);

  // Calculate the total number of pages for pagination
  const totalPages = Math.ceil(deposits.length / depositsPerPage);

  // Function to handle page change
  const handlePageChange = (pageNumber) => {
    // Ensure the page number is within valid bounds
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber); // Update the current page
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-background dark:bg-card-foreground">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Ethereum Transactions Tracker
      </h1>
      {loading ? (
        // Display a loading message while data is being fetched
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
                // Display a message if no deposits are available
                <tr>
                  <td colSpan="5" className="py-3 px-4 text-center text-black">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                // Map over the deposits and display them in table rows
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
