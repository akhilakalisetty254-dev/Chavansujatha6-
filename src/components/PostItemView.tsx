import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  Info,
  Layers,
  MapPin,
} from 'lucide-react';
import { CampusItem, Category, Condition } from '../types';

interface PostItemViewProps {
  onItemPublished: (item: CampusItem) => void;
  onCancel: () => void;
  onOpenAiPricing: (itemName: string, cat: string) => void;
}

export const PostItemView: React.FC<PostItemViewProps> = ({
  onItemPublished,
  onCancel,
  onOpenAiPricing,
}) => {
  // Form fields
  const [name, setName] = useState('');
  const [cat, setCat] = useState<CampusItem['cat']>('Study');
  const [price, setPrice] = useState<string>('30');
  const [deposit, setDeposit] = useState<string>('300');
  const [condition, setCondition] = useState<Condition>('Like new');
  const [location, setLocation] = useState('Central Library Entrance');
  const [desc, setDesc] = useState('');
  const [rules, setRules] = useState('');

  // AI Image Generation state using gemini-3-pro-image-preview
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('2K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:3' | '16:9'>('1:1');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageGenError, setImageGenError] = useState<string | null>(null);
  const [activePhotoTab, setActivePhotoTab] = useState<'ai' | 'presets' | 'url'>('ai');
  const [customUrl, setCustomUrl] = useState('');

  // Selected final image for the listing
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<'1K' | '2K' | '4K' | undefined>(undefined);

  // Quick preset templates for image generation
  const AI_TEMPLATES = [
    { label: '🧮 Scientific Calculator', prompt: 'Casio FX-991 scientific calculator on college study desk with engineering notebook, crisp lighting, high detail' },
    { label: '📷 DSLR Camera Kit', prompt: 'Canon DSLR camera with zoom lens and camera strap on wooden studio table, professional product photography' },
    { label: '🏏 Cricket Bat', prompt: 'English willow cricket bat with embossed grip and red leather cricket ball on grass field, sharp focus' },
    { label: '👕 Electric Iron', prompt: 'Compact modern steam iron with non-stick soleplate on clean wooden table, student hostel appliance' },
    { label: '🔊 Bluetooth Speaker', prompt: 'Cylindrical portable wireless bluetooth speaker with rubberized finish, studio lighting' },
    { label: '📐 Drafting Set', prompt: 'Technical engineering drafting kit with compass and transparent set squares inside open case' },
  ];

  // Campus curated fallback presets
  const CURATED_PRESETS = [
    { title: 'Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80', res: '2K' as const },
    { title: 'Camera', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80', res: '4K' as const },
    { title: 'Drafting Tools', url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80', res: '1K' as const },
    { title: 'Football', url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80', res: '1K' as const },
    { title: 'Speaker', url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80', res: '2K' as const },
    { title: 'Mini Projector', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80', res: '4K' as const },
  ];

  const handleGenerateImage = async () => {
    const promptToUse = imagePrompt.trim() || `${name} for college student rental`;
    if (!promptToUse) {
      setImageGenError('Please enter a description or item name for the image.');
      return;
    }

    setIsGeneratingImage(true);
    setImageGenError(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          imageSize,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImageUrl(data.imageUrl);
      // Auto apply to listing
      setSelectedImageUrl(data.imageUrl);
      setSelectedResolution(imageSize);
    } catch (err: any) {
      console.error(err);
      setImageGenError(err.message || 'Image generation unavailable. You can use preset photos or direct URL.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numPrice = Number(price) || 20;
    const numDeposit = Number(deposit) || numPrice * 10;

    const ruleArray = rules
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const newItem: CampusItem = {
      id: Date.now(),
      name: name.trim(),
      cat,
      price: numPrice,
      weeklyDiscount: 20,
      deposit: numDeposit,
      condition,
      owner: 'Alex Johnson (You)',
      ownerYear: '3rd Year • Computer Science',
      ownerRating: 5.0,
      ownerReviewsCount: 1,
      icon:
        cat === 'Study'
          ? '🧮'
          : cat === 'Electronics'
          ? '💻'
          : cat === 'Sports'
          ? '🏏'
          : cat === 'Books'
          ? '📚'
          : '🏠',
      imageUrl: selectedImageUrl || undefined,
      imageResolution: selectedResolution,
      desc:
        desc.trim() ||
        `${name.trim()} available for fellow campus students to rent and reuse. In ${condition.toLowerCase()} condition.`,
      location: location.trim() || 'Central Library Entrance',
      available: true,
      rules: ruleArray.length > 0 ? ruleArray : ['Return on time in same condition', 'Keep all cables / parts together'],
      createdAt: new Date().toISOString().split('T')[0],
    };

    onItemPublished(newItem);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="pb-2 border-b border-gray-200">
        <h1 className="text-2xl font-black text-gray-900">Post an Unused Item</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Turn items lying around your hostel room into pocket money while helping another student save.
        </p>
      </div>

      <form onSubmit={handlePublish} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4 text-xs">
              <h2 className="font-extrabold text-sm text-gray-900 flex items-center justify-between">
                <span>1. Item Details</span>
                <button
                  type="button"
                  onClick={() => onOpenAiPricing(name || 'Item', cat)}
                  className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI for Pricing & Deposit</span>
                </button>
              </h2>

              {/* Item Name */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Item Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!imagePrompt) setImagePrompt(e.target.value);
                  }}
                  placeholder="e.g. Casio FX-991CW Scientific Calculator"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none text-sm"
                />
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={cat}
                    onChange={(e: any) => setCat(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="Study">Study & Lab</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Sports">Sports & Fitness</option>
                    <option value="Hostel">Hostel Life</option>
                    <option value="Books">Books & Notes</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e: any) => setCondition(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="Like new">Like new (Flawless)</option>
                    <option value="Good">Good (Minor wear)</option>
                    <option value="Fair / Used">Fair / Used (Fully working)</option>
                  </select>
                </div>
              </div>

              {/* Pricing & Deposit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Rent / Day (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min="5"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="30"
                      className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Recommended: 1-3% of value</div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Refundable Deposit (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      placeholder="300"
                      className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Returned upon item return</div>
                </div>
              </div>

              {/* Handover Spot */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Campus Handover Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Central Library 1st Floor or Hostel Block B"
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Description & Specifications
                </label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Describe condition, battery health, accessories included, and exam compatibility..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              {/* Rules / Guidelines */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Borrower Guidelines (One per line)
                </label>
                <textarea
                  rows={2}
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder="e.g.&#10;Handle lens with care&#10;Do not use outdoors in rain&#10;Return with charging cable"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none resize-none font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Right Column: AI Image Studio with gemini-3-pro-image-preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm text-gray-900">
                      AI Photo Studio
                    </h2>
                    <div className="text-[10px] text-purple-700 font-bold">
                      Powered by gemini-3-pro-image-preview
                    </div>
                  </div>
                </div>

                {/* Tab switch */}
                <div className="flex bg-gray-100 p-0.5 rounded-xl text-[10px]">
                  <button
                    type="button"
                    onClick={() => setActivePhotoTab('ai')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      activePhotoTab === 'ai' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-500'
                    }`}
                  >
                    Gemini AI
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePhotoTab('presets')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      activePhotoTab === 'presets' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-500'
                    }`}
                  >
                    Presets
                  </button>
                </div>
              </div>

              {/* Gemini 3 Pro Image Generator Tab */}
              {activePhotoTab === 'ai' && (
                <div className="space-y-3 pt-1">
                  {/* Prompt input */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Item Visual Prompt
                    </label>
                    <textarea
                      rows={2}
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="e.g. Casio scientific calculator on a clean study table with notebooks, sharp realistic product photo"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 outline-none text-xs resize-none"
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                      Quick Suggestions
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {AI_TEMPLATES.map((tpl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setImagePrompt(tpl.prompt);
                            if (!name) setName(tpl.label.replace(/^[^\w]+/, ''));
                          }}
                          className="px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-medium transition-colors"
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Affordance for User to Specify Image Size (1K, 2K, 4K) as required! */}
                  <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-purple-900 text-xs flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-600" />
                        <span>Resolution Affordance (gemini-3-pro-image-preview)</span>
                      </span>
                      <span className="text-[10px] font-black text-purple-700 uppercase bg-purple-100 px-2 py-0.5 rounded-md">
                        {imageSize} Active
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {(['1K', '2K', '4K'] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setImageSize(size)}
                          className={`py-2 px-1 rounded-xl text-center font-black cursor-pointer transition-all border ${
                            imageSize === size
                              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                              : 'bg-white text-gray-700 border-purple-200/80 hover:bg-purple-50'
                          }`}
                        >
                          <div className="text-xs">{size}</div>
                          <div className={`text-[9px] ${imageSize === size ? 'text-purple-200' : 'text-gray-400'}`}>
                            {size === '1K' ? '1024 px' : size === '2K' ? '2048 px' : '4096 Ultra'}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Aspect Ratio Affordance */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-gray-600 font-medium">Aspect Ratio:</span>
                      <div className="flex gap-1">
                        {(['1:1', '4:3', '16:9'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setAspectRatio(r)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              aspectRatio === r
                                ? 'bg-purple-700 text-white'
                                : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    type="button"
                    disabled={isGeneratingImage}
                    onClick={handleGenerateImage}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Rendering {imageSize} photo with Gemini 3 Pro...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate {imageSize} Item Photo</span>
                      </>
                    )}
                  </button>

                  {imageGenError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      <span>{imageGenError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Curated Presets Tab */}
              {activePhotoTab === 'presets' && (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] text-gray-500">
                    Choose from campus photographic presets:
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {CURATED_PRESETS.map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedImageUrl(p.url);
                          setSelectedResolution(p.res);
                        }}
                        className={`relative rounded-xl overflow-hidden h-20 border-2 cursor-pointer transition-all ${
                          selectedImageUrl === p.url
                            ? 'border-indigo-600 ring-2 ring-indigo-200 scale-98'
                            : 'border-transparent hover:opacity-90'
                        }`}
                      >
                        <img src={p.url} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.2 bg-black/70 text-white text-[9px] rounded font-semibold">
                          {p.title}
                        </span>
                        {selectedImageUrl === p.url && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Selected Image Preview */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-gray-700">Listing Photo Preview</span>
                  {selectedResolution && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-700">
                      {selectedResolution} HD Photo
                    </span>
                  )}
                </div>

                <div className="relative rounded-2xl bg-gray-50 border border-gray-200 h-44 overflow-hidden flex items-center justify-center">
                  {selectedImageUrl ? (
                    <>
                      <img
                        src={selectedImageUrl}
                        alt="Selected listing preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImageUrl(null);
                          setSelectedResolution(undefined);
                        }}
                        className="absolute top-2 right-2 px-2 py-1 bg-black/70 hover:bg-black text-white text-[10px] rounded-lg font-bold backdrop-blur-sm cursor-pointer"
                      >
                        Change Photo
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-4 text-gray-400">
                      <Camera className="w-8 h-8 mx-auto mb-1 text-gray-300" />
                      <div className="text-[11px]">No photo attached yet</div>
                      <div className="text-[10px] text-gray-400">
                        Use Gemini 3 Pro generator above or pick a preset
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-indigo-100 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Publish to Campus</span>
          </button>
        </div>
      </form>
    </div>
  );
};
