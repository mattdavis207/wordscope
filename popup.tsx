import { useState } from "react"
import { IoClose, IoEllipsisHorizontal, IoSearch, IoSettings } from "react-icons/io5"
import "~/styles/tailwind.css"


function IndexPopup() {
  const [data, setData] = useState("")

  const [activeTab, setActiveTab] = useState("definitions")

  return (
    <div className="flex flex-col shadow-lg w-[330px] h-[600px] overflow-none" >

      {/* Header */}
      <div className="flex justify-between items-center bg-[#01122B] p-3 h-70">
        <div className="flex items-center">
          <div className="bg-[#3282B8] text-[#000a1b] font-bold rounded-full w-7 h-7 flex items-center justify-center mr-2">
            W
          </div>
          <span className="text-[#BBE1FA] text-base font-medium lowercase">wordscope</span>
        </div>
        <div className="flex space-x-2">
          <button className="text-[#BBE1FA] text-sm hover:text-white"><IoSettings size={20}/></button>
          <button className="text-[#BBE1FA] text-sm hover:text-white"><IoEllipsisHorizontal size={20}/></button>
          <button className="text-[#BBE1FA] text-sm hover:text-white" onClick={() => window.close()}><IoClose size={20}/></button>
        </div>
      </div>


      {/* Search Bar */}
      <div className="flex py-2 px-3 bg-[#072141]">
        <input
          type="text"
          placeholder="Search word... "
          className="flex-1 bg-[#112844] text-white placeholder:text-gray-400 px-3 py-2 m-2 rounded-md outline-none"
        />
        <button className="hover:bg-[#1c2f47] px-3 py-2 my-2 rounded-lg text-[#97cbe0]"><IoSearch size={20} /></button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 p-3 bg-[#000a1b]">
          <button className= {`flex-1 px-3 py-2 rounded-md ${
              activeTab === "definitions"
                ? "bg-[#2A4E75] text-[#BBE1FA] font-semibold"
                : "text-[#BBE1FA] hover:bg-[#072141]"
            }`}
            onClick = {() => setActiveTab("definitions")} 
          >
            Definitions
          </button>

        <button
            onClick={() => setActiveTab("sources")}
            className={`flex-1 px-3 py-2 rounded-md ${
              activeTab === "sources"
                ? "bg-[#2A4E75] text-[#BBE1FA] font-semibold"
                : "text-[#BBE1FA] hover:bg-[#072141]"
            }`}
          >
            Sources
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 px-3 py-2 rounded-md ${
              activeTab === "history"
                ? "bg-[#2A4E75] text-[#BBE1FA] font-semibold"
                : "text-[#BBE1FA] hover:bg-[#072141]"
            }`}
          >
            History
          </button>
      </div>

      {/* Main Body */}
      <div className= "flex-1 bg-[#072141]">

        {/* Conditionally render tabs */}
        {activeTab === "definitions" && <div>Definition content here</div>}
        {activeTab === "sources" && <div>Source content here</div>}
        {activeTab === "history" && <div>History content here</div>}
        

      </div>

    </div>
  )
}

export default IndexPopup


