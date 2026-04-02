import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import IdeaInput from './components/IdeaInput';
import CatalogCard from './components/CatalogCard';
import IdeaDetail from './components/IdeaDetail';
import { Search } from 'lucide-react';
import { buildApiUrl } from './lib/api';

function App() {
  const [entries, setEntries] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Poll for updates every 5 seconds
  useEffect(() => {
    fetchCatalogs();
    const interval = setInterval(fetchCatalogs, 5000);
    return () => clearInterval(interval);
  }, [searchQuery]);

  const fetchCatalogs = async () => {
    const isSearchMode = Boolean(searchQuery.trim());

    if (isSearchMode) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }

    try {
      let res;
      if (isSearchMode) {
        // Search catalogs using vector similarity
        res = await fetch(buildApiUrl('/api/catalogs/search'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchQuery,
            limit: 50
          })
        });
      } else {
        // Get all catalogs
        res = await fetch(buildApiUrl('/api/catalogs/'));
      }
      
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (e) {
      console.error("Failed to fetch catalogs", e);
    } finally {
      if (isSearchMode) setIsSearching(false);
      if (loading) setLoading(false);
    }
  };

  const handleIdeaSubmit = async ({ raw_input, input_type }) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(buildApiUrl('/api/ideas/submit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_input, input_type })
      });
      if (res.ok) {
        // Optimistically reload
        fetchCatalogs();
      }
    } catch (e) {
      console.error("Failed to submit idea", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-[-10vw] w-[40vw] h-[40vw] bg-neo-accent rounded-full opacity-[0.03] blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10vw] right-[-10vw] w-[50vw] h-[50vw] bg-white rounded-full opacity-[0.02] blur-[120px] pointer-events-none"></div>

       <div className="max-w-6xl mx-auto relative z-10">
         <Header />

         {selectedEntry ? (
           <div className="mt-8">
             <IdeaDetail
               entry={selectedEntry}
               onBack={() => setSelectedEntry(null)}
             />
           </div>
         ) : (
           <>
             <IdeaInput onSubmit={handleIdeaSubmit} isSubmitting={isSubmitting} />

             <div className="mt-20">
               <div className="flex items-center justify-between mb-8 border-b-2 border-neo-border pb-4">
                 <div className="flex flex-col">
                   <h2 className="text-4xl font-display font-bold uppercase tracking-tighter">
                     Intelligence <span className="text-neo-muted">Catalog</span>
                   </h2>
                   <div className="flex items-center gap-2">
                     <input
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       placeholder="Search catalogs..."
                       className="px-3 py-1 bg-black/40 text-white border border-neo-border focus:outline-none focus:ring-2 focus:ring-neo-accent w-[200px]"
                     />
                     <button
                       onClick={fetchCatalogs}
                       disabled={!searchQuery.trim() || isSearching}
                       className={`px-4 py-2 bg-neo-accent text-black font-display font-bold uppercase tracking-wider transition-colors hover:bg-white hover:text-black disabled:opacity-50`}
                     >
                       {isSearching ? 'Searching...' : 'Search'}
                     </button>
                   </div>
                 </div>
                 <div className="text-sm font-sans font-medium bg-black px-3 py-1 border border-neo-border text-neo-accent">
                   {entries.length} ENTRIES
                 </div>
               </div>

              {loading ? (
                <div className="flex justify-center p-12">
                  <div className="w-12 h-12 border-4 border-neo-border border-t-white rounded-full animate-spin"></div>
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center p-16 border-2 border-dashed border-neo-border bg-black/10">
                  <p className="font-display text-xl text-neo-muted uppercase tracking-widest">No ideas hatched yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                  {entries.map((entry, index) => (
                    <CatalogCard
                      key={entry.id}
                      entry={entry}
                      index={index}
                      onSelect={() => setSelectedEntry(entry)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
