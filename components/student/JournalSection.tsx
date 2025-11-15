import React, { useState, useEffect, useMemo } from 'react';
import { JournalEntry } from '../../types';
import { getStudentJournal, addJournalEntry } from '../../services/api';
import { PlusIcon } from '../shared/icons/Icons';

interface JournalSectionProps {
  studentId: string;
}

const JournalSection: React.FC<JournalSectionProps> = ({ studentId }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    getStudentJournal(studentId).then(setEntries);
  }, [studentId]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;
    const newEntry = await addJournalEntry(studentId, newTitle, newContent);
    setEntries([newEntry, ...entries]);
    setIsCreating(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleCancel = () => {
    setIsCreating(false);
    setNewTitle('');
    setNewContent('');
  };

  const filteredAndSortedEntries = useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();

    const filtered = entries.filter(entry => {
        const matchesSearchTerm = searchTerm
            ? entry.title.toLowerCase().includes(lowercasedTerm) ||
              entry.content.toLowerCase().includes(lowercasedTerm)
            : true;

        const entryDate = entry.createdAt;
        const matchesStartDate = startDate ? entryDate >= new Date(startDate) : true;
        const matchesEndDate = endDate ? entryDate <= new Date(new Date(endDate).setHours(23, 59, 59, 999)) : true;
        
        return matchesSearchTerm && matchesStartDate && matchesEndDate;
    });
    
    return filtered.sort((a, b) => {
        if (sortOrder === 'newest') {
            return b.createdAt.getTime() - a.createdAt.getTime();
        } else {
            return a.createdAt.getTime() - b.createdAt.getTime();
        }
    });
  }, [searchTerm, entries, sortOrder, startDate, endDate]);

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">My Journal</h2>
      </div>

      <div className="p-4 mb-6 bg-gray-100 rounded-lg dark:bg-gray-800/50">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="md:col-span-2 lg:col-span-2">
                <label htmlFor="search-term" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Search by keyword</label>
                <input
                    id="search-term"
                    type="text"
                    placeholder="e.g., exam stress, project ideas..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
            </div>
            <div>
                <label htmlFor="start-date" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
                <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
            </div>
            <div>
                <label htmlFor="end-date" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
                <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
            </div>
            <div>
                 <label htmlFor="sort-order" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Sort by</label>
                <select
                    id="sort-order"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                    className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
            </div>
        </div>
    </div>


      {isCreating && (
        <div className="p-6 mb-6 bg-white rounded-lg shadow-md dark:bg-gray-800 animate-fade-in-up">
            <h3 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">New Journal Entry</h3>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label htmlFor="journal-title" className="sr-only">Title</label>
                <input
                  id="journal-title"
                  type="text"
                  placeholder="Title"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                  className="w-full p-2 text-gray-900 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="journal-content" className="sr-only">What's on your mind?</label>
                <textarea
                  id="journal-content"
                  placeholder="What's on your mind?"
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  rows={5}
                  required
                  className="w-full p-2 text-gray-900 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end pt-2 space-x-2">
                <button type="button" onClick={handleCancel} className="px-4 py-2 font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save Entry</button>
              </div>
            </form>
          </div>
      )}

      <div className="pb-24 space-y-4">
        {filteredAndSortedEntries.length > 0 ? filteredAndSortedEntries.map(entry => (
          <div key={entry.id} className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{entry.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{entry.createdAt.toLocaleDateString()}</p>
            <p className="mt-2 text-gray-700 dark:text-gray-300">{entry.content}</p>
          </div>
        )) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
                {searchTerm || startDate || endDate ? 'No entries match your current filters.' : 'No journal entries yet. Create one to get started!'}
            </p>
        )}
      </div>

      {!isCreating && (
        <button
          onClick={() => setIsCreating(true)}
          className="fixed z-50 flex items-center justify-center w-16 h-16 text-white bg-indigo-600 rounded-full shadow-lg bottom-8 left-1/2 -translate-x-1/2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          aria-label="Create new journal entry"
        >
          <PlusIcon />
        </button>
      )}
    </div>
  );
};

export default JournalSection;