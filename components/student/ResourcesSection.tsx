import React, { useState, useEffect } from 'react';
import { Resource } from '../../types';
import { getResources } from '../../services/api';

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className="flex flex-col overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <img className="object-cover w-full h-48" src={resource.imageUrl} alt={resource.title} />
            <div className="flex flex-col justify-between flex-1 p-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{resource.title}</h3>
                    <p className={`mt-3 text-base text-gray-600 dark:text-gray-400 ${!isExpanded ? 'line-clamp-3' : ''}`}>
                        {isExpanded ? resource.content : resource.summary}
                    </p>
                </div>
                <div className="mt-6">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                        {isExpanded ? 'Read Less' : 'Read More'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const ResourcesSection: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);

    useEffect(() => {
        getResources().then(setResources);
    }, []);

    return (
        <div>
            <h2 className="mb-6 text-3xl font-bold text-gray-800 dark:text-white">Helpful Resources</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {resources.map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                ))}
            </div>
        </div>
    );
};

export default ResourcesSection;