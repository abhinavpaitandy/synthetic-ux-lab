/**
 * Mock admin settings service.
 *
 * Provides a storage-backed settings store that abstracts away localStorage
 * so it can later be swapped for GET/PATCH /api/admin/settings without
 * changing consuming components.
 *
 * No secrets are stored. The AI settings only track whether an API key
 * has been configured (apiKeyConfigured: boolean), never the key itself.
 */

import { useEffect, useState, useCallback } from "react";

import type { AdminSettings } from "./types";

// ─── Defaults ─────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AdminSettings = {
  configVersion: 1,
  lastUpdated: "2026-09-16T00:00:00Z",

  general: {
    defaultDevice: "mobile",
    defaultPilotSize: 500,
    defaultBehaviourDiversity: "medium",
    minVariants: 2,
    maxVariants: 3,
    maxUploadSizeMb: 10,
    supportedImageTypes: ["image/png", "image/jpeg", "image/jpg"],
    maxImageWidth: 4096,
    maxImageHeight: 4096,
  },

  ai: {
    provider: "mock",
    modelId: "mock-vision-v1",
    visionCapable: true,
    temperature: 0.4,
    apiKeyConfigured: false,
  },

  simulation: {
    batchSize: 20,
    concurrency: 3,
    maxRetries: 2,
    timeoutSeconds: 60,
    retryOnTimeout: true,
    retryOnRateLimit: true,
    retryOnInvalidJson: false,
  },

  population: {
    dimensions: [
      {
        key: "digitalFamiliarity",
        label: "Digital familiarity",
        description: "How comfortable the simulated user is with digital products.",
      },
      {
        key: "attentionSpan",
        label: "Attention span",
        description: "How long the simulated user stays focused before exploring.",
      },
      {
        key: "patience",
        label: "Patience",
        description: "Tolerance for slow or confusing interactions.",
      },
      {
        key: "interactionStyle",
        label: "Interaction style",
        description: "Whether the user scans or reads methodically.",
      },
      { key: "urgency", label: "Urgency", description: "Time pressure on the simulated task." },
      {
        key: "riskTolerance",
        label: "Risk tolerance",
        description: "Willingness to try unfamiliar actions.",
      },
      {
        key: "readingDepth",
        label: "Reading depth",
        description: "How thoroughly the user reads labels and instructions.",
      },
      {
        key: "explorationTendency",
        label: "Exploration tendency",
        description: "Likelihood of exploring non-target elements.",
      },
      {
        key: "goalCommitment",
        label: "Goal commitment",
        description: "How persistently the user pursues the task.",
      },
    ],
    cohortTemplates: [
      {
        id: "hurried",
        name: "Hurried",
        description: "Scans for the primary action and commits quickly.",
        enabled: true,
        weight: 25,
      },
      {
        id: "cautious",
        name: "Cautious",
        description: "Re-reads and verifies before committing.",
        enabled: true,
        weight: 25,
      },
      {
        id: "experienced",
        name: "Experienced",
        description: "Familiar with similar interfaces; efficient.",
        enabled: true,
        weight: 20,
      },
      {
        id: "low-familiarity",
        name: "Low familiarity",
        description: "New to this type of interface; needs clear signals.",
        enabled: true,
        weight: 15,
      },
      {
        id: "low-attention",
        name: "Low attention",
        description: "Easily distracted; may abandon if not immediately clear.",
        enabled: true,
        weight: 10,
      },
      {
        id: "exploratory",
        name: "Exploratory",
        description: "Explores the interface broadly before acting.",
        enabled: true,
        weight: 5,
      },
    ],
  },

  evaluation: {
    minSimulationsForWinner: 100,
    statisticalSignificanceThreshold: 0.05,
    minWinningMarginPp: 5,
    activeSnapshotMetrics: [
      "correctFirstAction",
      "correctTargetSelection",
      "confusionRate",
      "noActionRate",
    ],
    informationalMetrics: ["averageAgentCertainty"],
  },

  features: {
    snapshotTesting: true,
    flowTesting: false,
    htmlUrlVariants: false,
    interactivePrototypeTesting: false,
    testMode: false,
    statsigIntegration: false,
    syntheticHeatmaps: true,
    aiTargetDetection: true,
    manualTargetAdjustment: true,
    reportAgent: true,
  },
};

// ─── Storage abstraction ──────────────────────────────────────────

const STORAGE_KEY = "synthetic-ux-lab:admin-settings";

function loadFromStorage(): AdminSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as AdminSettings;
    return mergeDefaults(parsed);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveToStorage(settings: AdminSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore quota / privacy mode errors
  }
}

function mergeDefaults(partial: Partial<AdminSettings>): AdminSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...partial,
    general: { ...DEFAULT_SETTINGS.general, ...partial.general },
    ai: { ...DEFAULT_SETTINGS.ai, ...partial.ai },
    simulation: { ...DEFAULT_SETTINGS.simulation, ...partial.simulation },
    population: { ...DEFAULT_SETTINGS.population, ...partial.population },
    evaluation: { ...DEFAULT_SETTINGS.evaluation, ...partial.evaluation },
    features: { ...DEFAULT_SETTINGS.features, ...partial.features },
  };
}

// ─── Service API ──────────────────────────────────────────────────

export function getSettings(): AdminSettings {
  return loadFromStorage();
}

export function updateSettings(patch: Partial<AdminSettings>): AdminSettings {
  const current = loadFromStorage();
  const merged = mergeDefaults({ ...current, ...patch });
  const next: AdminSettings = {
    ...merged,
    configVersion: current.configVersion + 1,
    lastUpdated: new Date().toISOString(),
  };
  saveToStorage(next);
  return next;
}

export function resetSettings(): AdminSettings {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  return DEFAULT_SETTINGS;
}

// ─── React hook for components ────────────────────────────────────

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>(() => getSettings());

  const update = useCallback((patch: Partial<AdminSettings>) => {
    setSettings(updateSettings(patch));
  }, []);

  const reset = useCallback(() => {
    setSettings(resetSettings());
  }, []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setSettings(loadFromStorage());
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    }
  }, []);

  return { settings, update, reset };
}

export { DEFAULT_SETTINGS };
