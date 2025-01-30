'use client';

import React from 'react';
import { ItemPageTemplate } from '../components/ItemPageTemplate';

export default function GiftCardPage({ params }) {
  return <ItemPageTemplate id={params.id} />;
} 