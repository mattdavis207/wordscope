import { useEffect, useState } from "react"
import { definitionSources } from "../sources/definitionSources"
import { RxDragHandleDots2 } from "react-icons/rx"
import { ReactSortable as Sortable } from "react-sortablejs"
import { useSourceSettings } from "../hooks/useSourceSettings"

import "~/public/styles/tailwind.css"
import "~/public/styles/globals.css";
import { injectSavedThemes } from "../hooks/injectThemes";
import type { Theme } from "../hooks/injectThemes"

// Definition sources loaded

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

  const [themes, setThemes] = useState<Theme[]>([]);
  const [appliedTheme, setAppliedTheme] = useState<string>("");

  useEffect(() => {
    const loadThemes = async () => {
      await injectSavedThemes(setThemes, setAppliedTheme);
    };
    loadThemes();
  }, []);

  const [expanded, setExpanded] = useState<string | null>(null)

  // Render this if still loading
  if (loading || sourceOrder.length === 0) return null

  return (
    <div className="flex flex-1 flex-col p-4 space-y-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-text flex items-center gap-2 mb-3">
        <RxDragHandleDots2 size={20} /> Content Sources
      </h2>

      <SortableWrapper
        key={sourceOrder.join("-")} // forces remount if order changes
        tag="div"
        list={sourceOrder}
        setList={(newOrder) => {
          setSourceOrder(newOrder)
          saveSettings(newOrder, enabledSources)
        }}
      >
        {sourceOrder.filter((key) => definitionSources[key]).map((key) => {
          const source = definitionSources[key]
          return (
            <div
              key={key}
              className="flex items-start bg-background rounded-lg p-3 shadow border border-gray-700 mb-2"
            >
              {/* Drag Handle */}
              <div className="flex items-center mr-3 text-otherText cursor-grab">
                <RxDragHandleDots2 size={24} />
              </div>

              {/* Source Info */}
              <div className="flex-1">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {typeof source.icon === "string" ? (
                      <img
                        src={source.icon}
                        alt={`${source.name} icon`}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <span className="text-xl">{source.icon}</span>
                    )}
                    <span className="font-medium text-dataText">{source.name}</span>
                  </div>

                  {/* Toggle */}
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

                {/* Description Section */}
                <div className="mt-2 text-sm text-otherText">
                  <p
                    className={`transition-all ${
                      expanded === key ? "" : "line-clamp-2"
                    }`}
                  >
                    {source.description}
                  </p>
                  {source.description.length > 80 && (
                    <button
                      className="text-[10px] text-blue-400 hover:underline mt-1"
                      onClick={() => setExpanded(expanded === key ? null : key)}
                    >
                      {expanded === key ? "Show Less" : "Show More"}
                    </button>
                  )}
                </div>

                {/* License */}
                {source.license && (
                  <div className="mt-2 flex justify-end">
                    <div className="text-[8px] text-right text-otherText leading-tight max-w-xs">
                      <p className="mb-0">{source.license.attribution}</p>
                      <a
                        href={source.license.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-dataText"
                      >
                        {source.license.name}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </SortableWrapper>

    </div>
  )
}
