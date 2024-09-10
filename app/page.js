// Import the Link component from Next.js for client-side navigation
import Link from "next/link";

export default function Home() {
  return (
    // Main container with a black background and centered content
    <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center">
      
      {/* Main heading */}
      <h1 className="text-4xl font-bold mb-8">
        Welcome to Ethereum Transaction Tracker
      </h1>
      
      {/* Container for navigation buttons */}
      <div className="flex space-x-4 mb-8">
        
        {/* Button for navigating to the Custom Tracker page */}
        <Link href="/CustomTracker">
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700">
            Custom Tracker
          </button>
        </Link>
        
        {/* Button for navigating to the API Tracker page */}
        <Link href="/EtherScanAPI">
          <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700">
            API Tracker
          </button>
        </Link>
        
      </div>
      
      {/* Display the smart contract address */}
      <p className="text-gray-400 mt-4">
        Smart Contract Address: 0x00000000219ab540356cBB839Cbe05303d7705Fa
      </p>
      
    </div>
  );
}
