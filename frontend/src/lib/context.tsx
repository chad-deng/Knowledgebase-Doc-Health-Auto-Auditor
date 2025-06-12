'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, Article, AuditRule, AuditResult, SystemComponent, FlowStep } from '@/types';

// Initial state
const initialState: AppState = {
  articles: {
    list: [],
    selected: null,
    searchParams: {
      search: '',
      category: '',
      tags: [],
      status: 'published',
      sortBy: 'lastModified',
      sortOrder: 'desc',
      offset: 0,
      limit: 10,
    },
    loading: { isLoading: false },
    error: { hasError: false },
    cache: new Map(),
  },
  audit: {
    rules: [],
    selectedRules: [],
    results: [],
    currentAudit: null,
    inProgress: false,
    loading: { isLoading: false },
    error: { hasError: false },
  },
  ai: {
    suggestions: [],
    quickFixes: [],
    recommendations: [],
    currentResponse: null,
    loading: { isLoading: false },
    error: { hasError: false },
  },
  ui: {
    selectedComponent: null,
    flowStep: 0,
    totalFlowSteps: 5,
    notifications: [],
    sidebarOpen: false,
    theme: 'light',
  },
};

// Action types
type AppAction =
  | { type: 'SET_ARTICLES'; payload: Article[] }
  | { type: 'SELECT_ARTICLE'; payload: Article | null }
  | { type: 'SET_SEARCH_PARAMS'; payload: Partial<AppState['articles']['searchParams']> }
  | { type: 'SET_ARTICLES_LOADING'; payload: { isLoading: boolean; message?: string } }
  | { type: 'SET_ARTICLES_ERROR'; payload: { hasError: boolean; message?: string; code?: string } }
  | { type: 'SET_AUDIT_RULES'; payload: AuditRule[] }
  | { type: 'SELECT_AUDIT_RULES'; payload: string[] }
  | { type: 'SET_AUDIT_RESULT'; payload: AuditResult }
  | { type: 'SET_AUDIT_LOADING'; payload: { isLoading: boolean; message?: string } }
  | { type: 'SET_AUDIT_ERROR'; payload: { hasError: boolean; message?: string; code?: string } }
  | { type: 'SET_AI_SUGGESTIONS'; payload: any[] }
  | { type: 'SET_AI_LOADING'; payload: { isLoading: boolean; message?: string } }
  | { type: 'SET_AI_ERROR'; payload: { hasError: boolean; message?: string; code?: string } }
  | { type: 'SELECT_COMPONENT'; payload: string | null }
  | { type: 'SET_FLOW_STEP'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: any }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' };

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ARTICLES':
      return {
        ...state,
        articles: {
          ...state.articles,
          list: action.payload,
          loading: { isLoading: false },
          error: { hasError: false },
        },
      };

    case 'SELECT_ARTICLE':
      return {
        ...state,
        articles: {
          ...state.articles,
          selected: action.payload,
        },
      };

    case 'SET_SEARCH_PARAMS':
      return {
        ...state,
        articles: {
          ...state.articles,
          searchParams: {
            ...state.articles.searchParams,
            ...action.payload,
          },
        },
      };

    case 'SET_ARTICLES_LOADING':
      return {
        ...state,
        articles: {
          ...state.articles,
          loading: action.payload,
        },
      };

    case 'SET_ARTICLES_ERROR':
      return {
        ...state,
        articles: {
          ...state.articles,
          error: action.payload,
          loading: { isLoading: false },
        },
      };

    case 'SET_AUDIT_RULES':
      return {
        ...state,
        audit: {
          ...state.audit,
          rules: action.payload,
          loading: { isLoading: false },
          error: { hasError: false },
        },
      };

    case 'SELECT_AUDIT_RULES':
      return {
        ...state,
        audit: {
          ...state.audit,
          selectedRules: action.payload,
        },
      };

    case 'SET_AUDIT_RESULT':
      return {
        ...state,
        audit: {
          ...state.audit,
          currentAudit: action.payload,
          results: [...state.audit.results.filter(r => r.articleId !== action.payload.articleId), action.payload],
          inProgress: false,
          loading: { isLoading: false },
          error: { hasError: false },
        },
      };

    case 'SET_AUDIT_LOADING':
      return {
        ...state,
        audit: {
          ...state.audit,
          loading: action.payload,
          inProgress: action.payload.isLoading,
        },
      };

    case 'SET_AUDIT_ERROR':
      return {
        ...state,
        audit: {
          ...state.audit,
          error: action.payload,
          loading: { isLoading: false },
          inProgress: false,
        },
      };

    case 'SET_AI_SUGGESTIONS':
      return {
        ...state,
        ai: {
          ...state.ai,
          suggestions: action.payload,
          loading: { isLoading: false },
          error: { hasError: false },
        },
      };

    case 'SET_AI_LOADING':
      return {
        ...state,
        ai: {
          ...state.ai,
          loading: action.payload,
        },
      };

    case 'SET_AI_ERROR':
      return {
        ...state,
        ai: {
          ...state.ai,
          error: action.payload,
          loading: { isLoading: false },
        },
      };

    case 'SELECT_COMPONENT':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedComponent: action.payload,
        },
      };

    case 'SET_FLOW_STEP':
      return {
        ...state,
        ui: {
          ...state.ui,
          flowStep: Math.max(0, Math.min(action.payload, state.ui.totalFlowSteps - 1)),
        },
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, action.payload],
        },
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== action.payload),
        },
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarOpen: !state.ui.sidebarOpen,
        },
      };

    case 'SET_THEME':
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload,
        },
      };

    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Custom hooks for specific features
export function useArticles() {
  const { state, dispatch } = useAppContext();
  
  return {
    articles: state.articles.list,
    selectedArticle: state.articles.selected,
    searchParams: state.articles.searchParams,
    loading: state.articles.loading,
    error: state.articles.error,
    setArticles: (articles: Article[]) => dispatch({ type: 'SET_ARTICLES', payload: articles }),
    selectArticle: (article: Article | null) => dispatch({ type: 'SELECT_ARTICLE', payload: article }),
    setSearchParams: (params: Partial<AppState['articles']['searchParams']>) => 
      dispatch({ type: 'SET_SEARCH_PARAMS', payload: params }),
    setLoading: (loading: { isLoading: boolean; message?: string }) => 
      dispatch({ type: 'SET_ARTICLES_LOADING', payload: loading }),
    setError: (error: { hasError: boolean; message?: string; code?: string }) => 
      dispatch({ type: 'SET_ARTICLES_ERROR', payload: error }),
  };
}

export function useAudit() {
  const { state, dispatch } = useAppContext();
  
  return {
    rules: state.audit.rules,
    selectedRules: state.audit.selectedRules,
    results: state.audit.results,
    currentAudit: state.audit.currentAudit,
    inProgress: state.audit.inProgress,
    loading: state.audit.loading,
    error: state.audit.error,
    setRules: (rules: AuditRule[]) => dispatch({ type: 'SET_AUDIT_RULES', payload: rules }),
    selectRules: (ruleIds: string[]) => dispatch({ type: 'SELECT_AUDIT_RULES', payload: ruleIds }),
    setAuditResult: (result: AuditResult) => dispatch({ type: 'SET_AUDIT_RESULT', payload: result }),
    setLoading: (loading: { isLoading: boolean; message?: string }) => 
      dispatch({ type: 'SET_AUDIT_LOADING', payload: loading }),
    setError: (error: { hasError: boolean; message?: string; code?: string }) => 
      dispatch({ type: 'SET_AUDIT_ERROR', payload: error }),
  };
}

export function useAI() {
  const { state, dispatch } = useAppContext();
  
  return {
    suggestions: state.ai.suggestions,
    quickFixes: state.ai.quickFixes,
    recommendations: state.ai.recommendations,
    currentResponse: state.ai.currentResponse,
    loading: state.ai.loading,
    error: state.ai.error,
    setSuggestions: (suggestions: any[]) => dispatch({ type: 'SET_AI_SUGGESTIONS', payload: suggestions }),
    setLoading: (loading: { isLoading: boolean; message?: string }) => 
      dispatch({ type: 'SET_AI_LOADING', payload: loading }),
    setError: (error: { hasError: boolean; message?: string; code?: string }) => 
      dispatch({ type: 'SET_AI_ERROR', payload: error }),
  };
}

export function useUI() {
  const { state, dispatch } = useAppContext();
  
  return {
    selectedComponent: state.ui.selectedComponent,
    flowStep: state.ui.flowStep,
    totalFlowSteps: state.ui.totalFlowSteps,
    notifications: state.ui.notifications,
    sidebarOpen: state.ui.sidebarOpen,
    theme: state.ui.theme,
    selectComponent: (componentId: string | null) => 
      dispatch({ type: 'SELECT_COMPONENT', payload: componentId }),
    setFlowStep: (step: number) => dispatch({ type: 'SET_FLOW_STEP', payload: step }),
    addNotification: (notification: any) => dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),
    removeNotification: (id: string) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }),
    toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    setTheme: (theme: 'light' | 'dark') => dispatch({ type: 'SET_THEME', payload: theme }),
  };
} 