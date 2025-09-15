import { useState, useEffect } from 'react';
import { STORE_TEMPLATES } from '../config/templates';
import { getSeedForTemplate, getItemsFromJsonData } from '../utils/dataUtils';
import seedData from '../lib/seed.json';

export type OnboardingStep = 'template' | 'progress' | 'done';
export type TemplateType = 'full' | 'minimal' | 'custom';

export interface OnboardingState {
  step: OnboardingStep;
  selectedTemplate: TemplateType;
  currentJsonData: any;
  customJsonApplied: boolean;
  progressMessage: string;
  loadingItems: Record<string, string[]>;
  completedItems: Record<string, string[]>;
  error: string | null;
  itemErrors: Record<string, Record<string, string>>;
  isLoading: boolean;
}

const initialItemsState = {
  store: [],
  regions: [],
  paymentProviders: [],
  shipping: [],
  categories: [],
  collections: [],
  products: [],
};

export function useOnboardingState() {
  const [state, setState] = useState<OnboardingState>({
    step: 'template',
    selectedTemplate: 'minimal',
    currentJsonData: null,
    customJsonApplied: false,
    progressMessage: '',
    loadingItems: { ...initialItemsState },
    completedItems: { ...initialItemsState },
    error: null,
    itemErrors: {},
    isLoading: false,
  });

  // Load JSON data when template changes
  useEffect(() => {
    if (state.selectedTemplate !== 'custom') {
      const templateData = getSeedForTemplate(state.selectedTemplate, seedData);
      setState(prev => ({
        ...prev,
        currentJsonData: templateData,
        customJsonApplied: false,
      }));
    } else {
      // For custom, start with basic template
      const basicData = getSeedForTemplate('minimal', seedData);
      setState(prev => ({
        ...prev,
        currentJsonData: basicData,
        customJsonApplied: false,
      }));
    }
  }, [state.selectedTemplate]);

  const setStep = (step: OnboardingStep) => {
    setState(prev => ({ ...prev, step }));
  };

  const setSelectedTemplate = (template: TemplateType) => {
    setState(prev => ({ ...prev, selectedTemplate: template }));
  };

  const setCurrentJsonData = (data: any) => {
    setState(prev => ({ ...prev, currentJsonData: data }));
  };

  const setCustomJsonApplied = (applied: boolean) => {
    setState(prev => ({ ...prev, customJsonApplied: applied }));
  };

  const setIsLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const setProgressMessage = (message: string) => {
    setState(prev => ({ ...prev, progressMessage: message }));
  };

  const setLoadingItems = (items: Record<string, string[]>) => {
    setState(prev => ({ ...prev, loadingItems: items }));
  };

  const setCompletedItems = (items: Record<string, string[]>) => {
    setState(prev => ({ ...prev, completedItems: items }));
  };

  const setItemErrors = (errors: Record<string, Record<string, string>>) => {
    setState(prev => ({ ...prev, itemErrors: errors }));
  };

  // Helper function to get display names from current data
  const getDisplayNamesFromData = (data: any) => {
    return {
      store: getItemsFromJsonData(data, 'store'),
      regions: getItemsFromJsonData(data, 'regions'),
      paymentProviders: getItemsFromJsonData(data, 'paymentProviders'),
      shipping: getItemsFromJsonData(data, 'shipping'),
      categories: getItemsFromJsonData(data, 'categories'),
      products: getItemsFromJsonData(data, 'products'),
      collections: getItemsFromJsonData(data, 'collections'),
    };
  };

  // Helper function to update UI based on progress
  const setProgress = (message: string) => {
    setProgressMessage(message);

    // Get the current display names (either from template or from actual data)
    const displayNames = state.currentJsonData
      ? getDisplayNamesFromData(state.currentJsonData)
      : STORE_TEMPLATES[state.selectedTemplate].displayNames;

    // Process based on current step
    if (
      message.includes('currencies') ||
      message.includes('countries') ||
      message.includes('regions')
    ) {
      // Mark previous steps as completed
      // No previous steps for regions
    } else if (message.includes('payment provider')) {
      // When working on payment providers, regions are completed
      setState(prev => ({
        ...prev,
        completedItems: {
          ...prev.completedItems,
          regions: [...displayNames.regions],
        },
        loadingItems: {
          ...prev.loadingItems,
          regions: [],
        }
      }));
    } else if (message.includes('shipping')) {
      // When working on shipping, regions and payment providers are completed
      setState(prev => ({
        ...prev,
        completedItems: {
          ...prev.completedItems,
          regions: [...displayNames.regions],
          paymentProviders: [...displayNames.paymentProviders],
        },
        loadingItems: {
          ...prev.loadingItems,
          paymentProviders: [],
        }
      }));
    } else if (message.includes('categories')) {
      // When working on categories, all previous steps are completed
      setState(prev => ({
        ...prev,
        completedItems: {
          ...prev.completedItems,
          regions: [...displayNames.regions],
          paymentProviders: [...displayNames.paymentProviders],
          shipping: [...displayNames.shipping],
        },
        loadingItems: {
          ...prev.loadingItems,
          shipping: [],
        }
      }));
    } else if (message.includes('collections')) {
      // When working on collections, all previous steps are completed
      setState(prev => ({
        ...prev,
        completedItems: {
          ...prev.completedItems,
          regions: [...displayNames.regions],
          paymentProviders: [...displayNames.paymentProviders],
          shipping: [...displayNames.shipping],
          categories: [...displayNames.categories],
        },
        loadingItems: {
          ...prev.loadingItems,
          categories: [],
        }
      }));
    } else if (message.includes('products')) {
      // When working on products, all previous steps are completed
      setState(prev => ({
        ...prev,
        completedItems: {
          ...prev.completedItems,
          regions: [...displayNames.regions],
          paymentProviders: [...displayNames.paymentProviders],
          shipping: [...displayNames.shipping],
          categories: [...displayNames.categories],
          collections: [...displayNames.collections || []],
        },
        loadingItems: {
          ...prev.loadingItems,
          collections: [],
        }
      }));
    } else if (message.includes('complete')) {
      // On completion, no loading items and all items are completed
      setState(prev => ({
        ...prev,
        loadingItems: {
          ...prev.loadingItems,
          products: [], // Clear loading state for products
        },
        completedItems: {
          store: [...displayNames.store],
          regions: [...displayNames.regions],
          paymentProviders: [...displayNames.paymentProviders],
          shipping: [...displayNames.shipping],
          categories: [...displayNames.categories],
          collections: [...displayNames.collections || []],
          products: [...displayNames.products],
        }
      }));
    }
  };

  // Helper functions to update individual item states
  const setItemLoading = (type: string, item: string) => {
    setState(prev => ({
      ...prev,
      loadingItems: {
        ...prev.loadingItems,
        [type]: [...prev.loadingItems[type], item],
      },
      itemErrors: {
        ...prev.itemErrors,
        [type]: prev.itemErrors[type] ? {
          ...prev.itemErrors[type],
          [item]: undefined
        } : {}
      }
    }));
  };

  const setItemCompleted = (type: string, item: string) => {
    setState(prev => ({
      ...prev,
      loadingItems: {
        ...prev.loadingItems,
        [type]: prev.loadingItems[type].filter((i) => i !== item),
      },
      completedItems: {
        ...prev.completedItems,
        [type]: [...prev.completedItems[type], item],
      },
      itemErrors: {
        ...prev.itemErrors,
        [type]: prev.itemErrors[type] ? {
          ...prev.itemErrors[type],
          [item]: undefined
        } : {}
      }
    }));
  };

  const setItemError = (type: string, item: string, errorMessage: string) => {
    setState(prev => ({
      ...prev,
      loadingItems: {
        ...prev.loadingItems,
        [type]: prev.loadingItems[type].filter((i) => i !== item),
      },
      itemErrors: {
        ...prev.itemErrors,
        [type]: {
          ...prev.itemErrors[type],
          [item]: errorMessage,
        }
      }
    }));
  };

  const resetOnboardingState = () => {
    setState(prev => ({
      ...prev,
      error: null,
      itemErrors: {},
      loadingItems: { ...initialItemsState },
      completedItems: { ...initialItemsState },
    }));
  };

  return {
    ...state,
    setStep,
    setSelectedTemplate,
    setCurrentJsonData,
    setCustomJsonApplied,
    setIsLoading,
    setError,
    setProgress,
    setLoadingItems,
    setCompletedItems,
    setItemErrors,
    setItemLoading,
    setItemCompleted,
    setItemError,
    resetOnboardingState,
    getDisplayNamesFromData,
  };
}