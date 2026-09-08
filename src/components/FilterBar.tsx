import React from 'react';
import { Search, SlidersHorizontal, Grid, List, Sparkles } from 'lucide-react';
import { ProjectCategory } from '../types';

interface FilterBarProps {
  selectedCategory: ProjectCategory;
  onSelectCategory: (category: ProjectCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'downloads' | 'newest' | 'diamonds' | 'title';
  onSortChange: (sort: 'downloads' | 'newest' | 'diamonds' | 'title') => void;
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
            placeholder="Search projects, tags, game versions, features..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
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
              onChange={(e) => onSortChange(e.target.value as any)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="downloads" className="bg-slate-900 text-slate-200">Most Downloaded</option>
              <option value="newest" className="bg-slate-900 text-slate-200">Newest Releases</option>
              <option value="diamonds" className="bg-slate-900 text-slate-200">Most Diamonds</option>
              <option value="title" className="bg-slate-900 text-slate-200">Alphabetical (A-Z)</option>
            </select>
          </div>

          {/* Grid / List view toggle */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5">
            <button
              id="view-mode-grid"
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-lg transition-colors ${
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
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-lg transition-colors ${
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
          return (
            <button
              key={cat.id}
              id={`filter-category-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 border border-slate-800/80'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Results Count & Drive Download Notice */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="text-emerald-400 font-bold">{totalResults}</span> {totalResults === 1 ? 'project' : 'projects'} in <span className="text-slate-200 font-medium capitalize">{selectedCategory.replace('-', ' ')}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400/90">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Clicking download immediately triggers the Google Drive file download</span>
        </div>
      </div>
    </div>
  );
};
