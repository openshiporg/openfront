"use client";

import { ItemPageTemplate } from "../components/ItemPageTemplate";

export default function ReturnItemPage({ params }) {
  return <ItemPageTemplate listKey="Return" id={params.id} />;
} 