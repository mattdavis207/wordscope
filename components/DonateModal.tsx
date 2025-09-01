import { useState } from "react"
import { FaBitcoin, FaEthereum, FaRegCopy, FaCheck } from "react-icons/fa"
import { SiSolana } from "react-icons/si"
import { HiOutlineXMark } from "react-icons/hi2"

import "~/public/styles/tailwind.css"
import "~/public/styles/globals.css"
import { Tooltip } from "~components/Tooltip"

type DonateModalProps = {
  onClose: () => void
}

export const DonateModal: React.FC<DonateModalProps> = ({ onClose }) => {
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({})

  // Copy to clipboard helper function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Handle error silently
    }
  }

  const handleCopy = async (address: string) => {
    await copyToClipboard(address)

    // Set copied for this address only
    setCopiedMap((prev) => ({ ...prev, [address]: true }))

    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [address]: false }))
    }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100000]">
      <div className="bg-mainBody text-text rounded-2xl shadow-2xl shadow-black/50 w-80 p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">❤️ Support the Developer</h2>
          <button
            onClick={onClose}
            className="text-text hover:text-red-400"
            title="Close"
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>
        <p className="text-sm mb-4 text-otherText">
          Support this extension's growth! Every crypto donation helps fund new features, bug fixes, and ongoing improvements.
        </p>

        {/* Donation Addresses */}
        <div className="space-y-3">
          {[
            { 
              name: "Bitcoin", 
              symbol: "BTC", 
              icon: <FaBitcoin size={20} className="text-yellow-400" />, 
              address: "1PQEEsLfYr2cyLz1K7TyDedXeqy1xxhCJ6" 
            },
            { 
              name: "Ethereum", 
              symbol: "ETH", 
              icon: <FaEthereum size={20} className="text-purple-400" />, 
              address: "0xd47FC586Bd8843a6c44FB112c844A5ac83909C52" 
            },
            { 
              name: "Solana", 
              symbol: "SOL", 
              icon: <SiSolana size={20} className="text-green-400" />, 
              address: "HqKfNYdtuw3f8PScJpaKQR3CgC4DrWHeGfzEMQacWGaL" 
            }
          ].map((coin) => (
            <div key={coin.symbol} className="flex items-center space-x-3 bg-dullBox rounded-lg p-3">
              {/* Crypto Icon */}
              <Tooltip text={coin.name}>
                <div className="text-xl cursor-pointer">
                  {coin.icon}
                </div>
              </Tooltip>

              {/* Address Text Box */}
              <input
                type="text"
                readOnly
                value={coin.address}
                className="flex-1 px-2 py-1 bg-mainBody rounded text-sm text-text cursor-default"
              />

              {/* Copy Button */}
              <div className="relative">
                <Tooltip text="Copy">
                  <button
                    onClick={() => handleCopy(coin.address)}
                    className="p-2 rounded-lg bg-tabActiveBg text-white hover:bg-dullBox transition"
                  >
                    {copiedMap?.[coin.address] ? (
                      <FaCheck size={16} className="text-green-400" />
                    ) : (
                      <FaRegCopy size={16} />
                    )}
                  </button>
                </Tooltip>

                {/* Tooltip */}
                {copiedMap[coin.address] && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-mainBody text-text text-xs px-2 py-1 rounded shadow">
                    Copied!
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-5 w-full px-4 py-2 rounded-lg bg-tabActiveBg text-dataText hover:bg-dullBox transition"
        >
          Close
        </button>
      </div>
    </div>
  )
}