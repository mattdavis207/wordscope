import { useState } from "react"


function IndexPopup() {
  const [data, setData] = useState("")

  return (
    <div
      id = {"main"}
      style={{
        padding: 16
      }}>
      <h2>
        Were working{" "}
        <a href="https://www.plasmo.com" target="_blank">
          Plasmo
        </a>{" "}
        Extension!
      </h2>
        <label htmlFor="ui">Type something</label>
        <input id="user-input" onChange={(e) => setData(e.target.value)} value={data} />

      <a href="https://docs.plasmo.com" target="_blank">
        View Docs
      </a>

     
    </div>
  )
}

export default IndexPopup
