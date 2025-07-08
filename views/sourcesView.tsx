import { definitionSources } from "../sources/definitionSources"
import { RxDragHandleDots2 } from "react-icons/rx"
import { ReactSortable as Sortable } from "react-sortablejs"
import { useSourceSettings } from "../hooks/useSourceSettings"

console.log("definitionSources keys:", Object.keys(definitionSources))

const SortableWrapper = (props) => <Sortable {...props} />

export function SourcesTab() {
  const {
    sourceOrder,
    enabledSources,
    loading,
    saveSettings,
    setSourceOrder,
    toggleSource,
    setEnabledSources
  } = useSourceSettings()

  // Render this if still loading
  if (loading || sourceOrder.length === 0) return null

  return (
    <div className="flex flex-1 flex-col p-4 space-y-4 overflow-y-auto" style = {{scrollbarWidth: 'none'}}>
      <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
        <RxDragHandleDots2 size={20} /> Content Sources
      </h2>

      <SortableWrapper
        key={sourceOrder.join("-")} // forces remount if order changes
        tag="div"
        list={sourceOrder}
        setList={(newOrder) => {
          const cleanedOrder = newOrder.map((item: { [x: string]: any }) => {
            if (typeof item === "string") return item
            if (typeof item === "object" && item !== null) {
              // Only grab numeric keys
              return Object.keys(item)
                .filter((k) => /^\d+$/.test(k))
                .sort((a, b) => Number(a) - Number(b))
                .map((k) => item[k])
                .join("")
            }
            return ""
          }).filter(Boolean)
        
          console.log("🧼 Cleaned drag result:", cleanedOrder)
          setSourceOrder(newOrder)
          saveSettings(newOrder, enabledSources)
        }}
      >
        {sourceOrder.filter((key) => definitionSources[key]).map((key) => {
          const source = definitionSources[key]
          return (
            <div
              key={key}
              className="flex items-start bg-[#01122B] rounded-lg p-3 shadow border border-gray-700 mb-2"
            >
              {/* Drag Handle */}
              <div className="flex items-center mr-3 text-gray-400 cursor-grab">
                <RxDragHandleDots2 size={20} />
              </div>

              {/* Source Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{source.icon}</span>
                  <span className="font-medium text-white">{source.name}</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  A dictionary source providing definitions and examples.
                </p>
              </div>

              {/* Enable/Disable Toggle */}
              <div className="flex items-center ml-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabledSources[key]}
                    onChange={() => toggleSource(key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-400 peer-focus:ring-4 rounded-full peer peer-checked:bg-blue-500 transition-all duration-300"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-full"></div>
                </label>
              </div>
            </div>
          )
        })}
      </SortableWrapper>

    </div>
  )
}
