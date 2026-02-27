import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import IdeaInput from './components/IdeaInput';
import CatalogCard from './components/CatalogCard';
import IdeaDetail from './components/IdeaDetail';

function App() {
  const [entries, setEntries] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Poll for updates every 5 seconds
  useEffect(() => {
    fetchCatalogs();
    const interval = setInterval(fetchCatalogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCatalogs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/catalogs/');
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (e) {
      console.error("Failed to fetch catalogs", e);
    } finally {
      if (loading) setLoading(false);
    }
  };

  const handleIdeaSubmit = async (raw_input) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/ideas/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_input })
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
                <h2 className="text-4xl font-display font-bold uppercase tracking-tighter">
                  Intelligence <span className="text-neo-muted">Catalog</span>
                </h2>
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
