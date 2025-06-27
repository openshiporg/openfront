"use client";

import React from "react";

interface Collection {
  id: string;
  title: string;
  handle: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

interface CollectionDetailsComponentProps {
  collection: Collection;
  list: any;
}

export function CollectionDetailsComponent({
  collection,
  list,
}: CollectionDetailsComponentProps) {
  return (
    <div className="px-4 md:px-6 py-4 border-b">
      <h3 className="text-lg font-medium mb-2">{collection.title}</h3>
      <pre className="text-sm bg-muted p-4 rounded overflow-auto">
        {JSON.stringify(collection, null, 2)}
      </pre>
    </div>
  );
}
