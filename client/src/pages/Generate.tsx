import React from "react";
import { useParams } from "react-router";
import { useState } from "react";
import  SoftBackDrop  from "../components/SoftBackDrop";
import AspectRatioSelector from "../components/AspectRatioSelector";
import StyleSelector from "../components/StyleSelector";
import  { type AspectRatio, type IThumbnail, type ThumbnailStyle, colorSchemes, dummyThumbnails } from "../assets/assets";
import ColorSchemeSelector from "../components/ColorSchemeSelector";
import PreviewPanel from "../components/PreviewPanel";
import { useEffect } from "react";
const Generate = () => {
  const { id } = useParams();
  const [title, setTitle] = React.useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [thumbnail, setThumbnail] = useState<IThumbnail | null>(null);
  const [loading, setLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [colorSchemeId, setColorSchemeId] = useState<string>(colorSchemes[0].id);
  const [style, setStyle] = useState<ThumbnailStyle>('Bold & Graphic');
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const handleGenerate = async () => {};


  const fetchThumbnail = async ()=> {
   if (id) {
    const thumbnail : any = dummyThumbnails.find((thumbnail) => thumbnail._id === id);
    if (thumbnail) {   
      setThumbnail(thumbnail);
      setAdditionalDetails(thumbnail.user_prompt)
      setTitle(thumbnail.title);
      setColorSchemeId(thumbnail.color_scheme_id)
      setAspectRatio(thumbnail.aspect_ratio)
      setStyle(thumbnail.style)
      setLoading(false)
    }
   }
}
useEffect(() => {
     if (id) {
        fetchThumbnail();

     }
}, [id])

  return (
    <>
      <SoftBackDrop />
      <div className="pt-24 min-h-screen ">
        <main className="max-w-6x1 mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
          <div className="grid lg:grid-cols-[400px_1fr] gap-8">
            {/* LEFT PANEL */}
            <div className={`space-y-6 ${id && "pointer-events-none"}`}>
              <div className="p-6 rounded-2x1 bg-white/8 border border-white/12 shadow-x1 space-y-6 rounded-xl">
                <div className="space-y-2 border-r-4 border-pink-500 pr-4">
                  <h2 className="text-xl font-bold text-zinc-100">
                    Create Your Thumbnail
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Provide the necessary details for your thumnail.
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Title or topic</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                      placeholder="Write your topic"
                      className="w-full px-4 py-3 rounded-xl bg-white/8 border border-white/12 shadow-x1 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
                    />
                    <div>
                      <span className="text-xs text-zinc-400">
                        {title.length}/100 characters
                      </span>
                    </div>
                  </div>
                  <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                  <StyleSelector value={style} onChange={setStyle} isOpen={styleDropdownOpen} setIsOpen={setStyleDropdownOpen} />
                  <ColorSchemeSelector value={colorSchemeId} onChange={setColorSchemeId} /> 
                  <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Additional Prompts <span className="text-zinc-400 text-xs">(optional)</span>
                      </label>
                      <textarea value={additionalDetails} onChange={(e) => setAdditionalDetails(e.target.value)} rows={3} placeholder="Add any specific elements, mood, or style preferences..." className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/6 text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none" />
                    </div>
                </div>
                {!id && (
                  <button onClick={handleGenerate}
                    className="text-[15px] w-full py-3.5 rounded-xl font-medium bg-linear-to-b from-pink-500 to-pink-600 hover:from-pink-700 disabled:cursor-not-allowed transition-colors">
                    {loading ? "Generating..." : "Generate Thumbnail"}
                  </button>
                )}
              </div>
            </div>
            {/* RIGHT PANEL */}
            <div>
              <div className="p-6 rounded 2x1 bg-white/8 border-white/10 shadow-x1">
              <h1 className="text-lg font-semibold text-zinc-100">Preview</h1>
              <PreviewPanel thumbnail={thumbnail} isLoading={loading} aspectRatio={aspectRatio} />
            </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Generate;
