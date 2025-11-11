import { useEffect, useState } from 'react';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { TonClient, Address } from '@ton/ton';
import { beginCell, toNano } from '@ton/core';

const client = new TonClient({ endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC' });
const COUNTER_CONTRACT_ADDRESS = 'EQA50DHn_qwsrAGXzL8T6HMZD_7g-JmZ0VCPoF2kENyyTBSr';

function App() {
  const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const [counter, setCounter] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadCounter() {
    try {
      const contractAddress = Address.parse(COUNTER_CONTRACT_ADDRESS);
      // Tact converts "counter()" getter to "get_counter"
      const response = await client.runMethod(contractAddress, 'get_counter', []);
      const counterValue = response.stack.readBigNumber();
      setCounter(counterValue.toString());
    } catch (error) {
      console.error('Error loading counter:', error);
      setCounter('Error');
    }
  }

  function createAddMessage(amount) {
    // Tact auto-generates op codes based on message hash
    // For "Add" message, you need to check the compiled contract
    // Common pattern: crc32("Add") or specific op code
    return beginCell()
      .storeUint(0x7e8764ef, 32)  // Try this op code for Add message (common Tact pattern)
      .storeUint(0, 64)            // queryId
      .storeUint(amount, 32)       // amount
      .endCell();
  }

  async function sendAddTransaction(amount) {
    if (!userFriendlyAddress) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const body = createAddMessage(amount);

      await tonConnectUI.sendTransaction({
        messages: [
          {
            address: COUNTER_CONTRACT_ADDRESS,
            amount: toNano(amount.toString()).toString(), // Increased gas fee
            payload: body.toBoc().toString('base64'),
          },
        ],
        validUntil: Math.floor(Date.now() / 1000) + 600,
      });

      // Wait a bit for the transaction to be processed
      setTimeout(() => {
        loadCounter();
        setLoading(false);
      }, 5000);
    } catch (error) {
      console.error('Transaction error:', error);
      alert('Transaction failed: ' + error.message);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCounter();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          TON Counter DApp
        </h1>

        {/* Wallet Connection */}
        <div className="mb-6">
          {userFriendlyAddress ? (
            <button
              onClick={() => tonConnectUI.disconnect()}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition font-medium"
            >
              {userFriendlyAddress.slice(0, 6)}...{userFriendlyAddress.slice(-4)}
            </button>
          ) : (
            <button
              onClick={() => tonConnectUI.openModal()}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition font-medium"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {/* Counter Display */}
        <div className="bg-white/5 rounded-xl p-6 mb-6 text-center">
          <p className="text-gray-300 text-sm mb-2">Current Counter Value</p>
          <div className="text-5xl font-bold text-white">
            {counter !== null ? counter : '...'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={loadCounter}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white px-4 py-3 rounded-lg transition font-medium"
          >
            🔄 Refresh Counter
          </button>

          {userFriendlyAddress && (
            <>
              <button
                onClick={() => sendAddTransaction(0.01)}
                disabled={loading}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white px-4 py-3 rounded-lg transition font-medium"
              >
                {loading ? '⏳ Processing...' : '➕ Add 1 to Counter'}
              </button>

              <button
                onClick={() => sendAddTransaction(5)}
                disabled={loading}
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-500 text-white px-4 py-3 rounded-lg transition font-medium"
              >
                {loading ? '⏳ Processing...' : '➕ Add 5 to Counter'}
              </button>

              <button
                onClick={() => sendAddTransaction(10)}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 text-white px-4 py-3 rounded-lg transition font-medium"
              >
                {loading ? '⏳ Processing...' : '➕ Add 10 to Counter'}
              </button>
            </>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Contract: {COUNTER_CONTRACT_ADDRESS.slice(0, 8)}...{COUNTER_CONTRACT_ADDRESS.slice(-6)}</p>
          <p className="mt-1">Network: Testnet</p>
        </div>
      </div>
    </div>
  );
}

export default App;