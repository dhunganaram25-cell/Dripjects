import React from 'react';
import { Search, SlidersHorizontal, Grid, List, Sparkles, Tag, X } from 'lucide-react';
import { ProjectCategory } from '../types';

export type SortOption = 'newest' | 'title' | 'title-desc';

interface FilterBarProps {
  selectedCategory: ProjectCategory;
  onSelectCategory: (category: ProjectCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag?: string | null;
  onClearTag?: () => void;
  categoryCounts?: Record<string, number>;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalResults: number;
}

const CATEGORIES: { id: ProjectCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All Projects', icon: '🌍' },
  { id: 'maps', label: 'Maps & Worlds', icon: '🗺️' },
  { id: 'texture-packs', label: 'Texture Packs', icon: '🎨' },
  { id: 'mods', label: 'Mods & Addons', icon: '⚙️' },
  { id: 'datapacks', label: 'Data Packs', icon: '📜' },
  { id: 'skins', label: 'Skins', icon: '👤' },
  { id: 'schematics', label: 'Schematics', icon: '🏛️' },
  { id: 'tools', label: 'Tools', icon: '🛠️' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedTag,
  onClearTag,
  categoryCounts = {},
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalResults,
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Search & Sort Controls Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="search-projects-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects by name, tags (#pvp), features..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort & View Options */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 hidden sm:inline">Sort:</span>
            <select
              id="sort-projects-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-slate-900 text-slate-200">Newest Releases</option>
              <option value="title" className="bg-slate-900 text-slate-200">Alphabetical (A-Z)</option>
              <option value="title-desc" className="bg-slate-900 text-slate-200">Alphabetical (Z-A)</option>
            </select>
          </div>

          {/* Grid / List view toggle */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5">
            <button
              id="view-mode-grid"
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              id="view-mode-list"
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = cat.id === 'all' 
            ? Object.values(categoryCounts).reduce<number>((sum, val) => sum + (Number(val) || 0), 0)
            : (categoryCounts[cat.id] || 0);

          return (
            <button
              key={cat.id}
              id={`filter-category-${cat.id}`}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 font-normal'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tag Filter indicator row */}
      {selectedTag && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 animate-in fade-in duration-150">
          <Tag className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active Tag Filter:</span>
          <span className="font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded text-white">
            #{selectedTag}
          </span>
          <button
            type="button"
            onClick={onClearTag}
            className="ml-auto flex items-center gap-1 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 rounded-md transition-colors cursor-pointer text-[11px]"
            title="Clear tag filter"
          >
            <X className="w-3 h-3" />
            <span>Clear Tag</span>
          </button>
        </div>
      )}

      {/* Results Count & Drive Download Notice */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="text-emerald-400 font-bold">{totalResults}</span> {totalResults === 1 ? 'project' : 'projects'} in <span className="text-slate-200 font-medium capitalize">{selectedCategory.replace('-', ' ')}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400/90">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Google Drive direct link & auto-copied unzip password</span>
        </div>
      </div>
    </div>
  );
};

