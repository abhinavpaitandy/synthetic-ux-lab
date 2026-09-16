/**
 * Shared experiment-creation draft store.
 *
 * Uses React Context so the draft survives navigation between the wizard
 * steps (Setup → Variants → Targets → Simulation). No external state
 * library — just Context + useReducer.
 */

import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";

import type {
  ExperimentDraft,
  DraftVariant,
  DetectedTarget,
  DeviceType,
  PilotSize,
  BehaviourDiversity,
} from "./types";

// ─── State ────────────────────────────────────────────────────────

const DEFAULT_DRAFT: ExperimentDraft = {
  name: "",
  persona: "",
  task: "",
  successEvent: "",
  hypothesis: undefined,
  device: "mobile",
  variants: [
    {
      id: "v-a",
      name: "Variant A",
      description: "",
      screenshotUrl: undefined,
      targetConfirmed: false,
    },
    {
      id: "v-b",
      name: "Variant B",
      description: "",
      screenshotUrl: undefined,
      targetConfirmed: false,
    },
  ],
  pilotSize: 500,
  behaviourDiversity: "medium",
};

// ─── Actions ──────────────────────────────────────────────────────

type DraftAction =
  | {
      type: "UPDATE_DETAILS";
      patch: Partial<
        Pick<
          ExperimentDraft,
          "name" | "persona" | "task" | "successEvent" | "hypothesis" | "device"
        >
      >;
    }
  | { type: "SET_VARIANTS"; variants: DraftVariant[] }
  | { type: "UPDATE_VARIANT"; variantId: string; patch: Partial<DraftVariant> }
  | { type: "ADD_VARIANT" }
  | { type: "REMOVE_VARIANT"; variantId: string }
  | { type: "SET_DETECTED_TARGET"; variantId: string; target: DetectedTarget }
  | { type: "CONFIRM_TARGET"; variantId: string; confirmed: boolean }
  | { type: "SET_PILOT_SIZE"; size: PilotSize }
  | { type: "SET_BEHAVIOUR_DIVERSITY"; diversity: BehaviourDiversity }
  | { type: "SET_DEVICE"; device: DeviceType }
  | { type: "RESET" };

// ─── Reducer ──────────────────────────────────────────────────────

const VARIANT_NAMES = ["Variant A", "Variant B", "Variant C"];

function reducer(state: ExperimentDraft, action: DraftAction): ExperimentDraft {
  switch (action.type) {
    case "UPDATE_DETAILS":
      return { ...state, ...action.patch };

    case "SET_VARIANTS":
      return { ...state, variants: action.variants };

    case "UPDATE_VARIANT":
      return {
        ...state,
        variants: state.variants.map((v) =>
          v.id === action.variantId ? { ...v, ...action.patch } : v,
        ),
      };

    case "ADD_VARIANT": {
      if (state.variants.length >= 3) return state;
      const idx = state.variants.length;
      const id = ["v-a", "v-b", "v-c"][idx] ?? `v-${idx}`;
      return {
        ...state,
        variants: [
          ...state.variants,
          {
            id,
            name: VARIANT_NAMES[idx] ?? `Variant ${idx + 1}`,
            description: "",
            targetConfirmed: false,
          },
        ],
      };
    }

    case "REMOVE_VARIANT": {
      if (state.variants.length <= 2) return state;
      return {
        ...state,
        variants: state.variants
          .filter((v) => v.id !== action.variantId)
          .map((v, i) => ({ ...v, name: VARIANT_NAMES[i] ?? v.name })),
      };
    }

    case "SET_DETECTED_TARGET":
      return {
        ...state,
        variants: state.variants.map((v) =>
          v.id === action.variantId ? { ...v, detectedTarget: action.target } : v,
        ),
      };

    case "CONFIRM_TARGET":
      return {
        ...state,
        variants: state.variants.map((v) =>
          v.id === action.variantId ? { ...v, targetConfirmed: action.confirmed } : v,
        ),
      };

    case "SET_PILOT_SIZE":
      return { ...state, pilotSize: action.size };

    case "SET_BEHAVIOUR_DIVERSITY":
      return { ...state, behaviourDiversity: action.diversity };

    case "SET_DEVICE":
      return { ...state, device: action.device };

    case "RESET":
      return { ...DEFAULT_DRAFT };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────

interface DraftContextValue {
  draft: ExperimentDraft;
  updateExperimentDetails: (
    patch: Partial<
      Pick<ExperimentDraft, "name" | "persona" | "task" | "successEvent" | "hypothesis" | "device">
    >,
  ) => void;
  setVariants: (variants: DraftVariant[]) => void;
  updateVariant: (variantId: string, patch: Partial<DraftVariant>) => void;
  addVariant: () => void;
  removeVariant: (variantId: string) => void;
  setDetectedTarget: (variantId: string, target: DetectedTarget) => void;
  confirmTarget: (variantId: string, confirmed: boolean) => void;
  setPilotSize: (size: PilotSize) => void;
  setBehaviourDiversity: (diversity: BehaviourDiversity) => void;
  setDevice: (device: DeviceType) => void;
  resetDraft: () => void;
}

const DraftContext = createContext<DraftContextValue | null>(null);

export function DraftProvider({ children }: { children: ReactNode }) {
  const [draft, dispatch] = useReducer(reducer, DEFAULT_DRAFT);

  const updateExperimentDetails = useCallback(
    (
      patch: Partial<
        Pick<
          ExperimentDraft,
          "name" | "persona" | "task" | "successEvent" | "hypothesis" | "device"
        >
      >,
    ) => dispatch({ type: "UPDATE_DETAILS", patch }),
    [],
  );

  const setVariants = useCallback(
    (variants: DraftVariant[]) => dispatch({ type: "SET_VARIANTS", variants }),
    [],
  );

  const updateVariant = useCallback(
    (variantId: string, patch: Partial<DraftVariant>) =>
      dispatch({ type: "UPDATE_VARIANT", variantId, patch }),
    [],
  );

  const addVariant = useCallback(() => dispatch({ type: "ADD_VARIANT" }), []);
  const removeVariant = useCallback(
    (variantId: string) => dispatch({ type: "REMOVE_VARIANT", variantId }),
    [],
  );

  const setDetectedTarget = useCallback(
    (variantId: string, target: DetectedTarget) =>
      dispatch({ type: "SET_DETECTED_TARGET", variantId, target }),
    [],
  );

  const confirmTarget = useCallback(
    (variantId: string, confirmed: boolean) =>
      dispatch({ type: "CONFIRM_TARGET", variantId, confirmed }),
    [],
  );

  const setPilotSize = useCallback(
    (size: PilotSize) => dispatch({ type: "SET_PILOT_SIZE", size }),
    [],
  );
  const setBehaviourDiversity = useCallback(
    (diversity: BehaviourDiversity) => dispatch({ type: "SET_BEHAVIOUR_DIVERSITY", diversity }),
    [],
  );
  const setDevice = useCallback(
    (device: DeviceType) => dispatch({ type: "SET_DEVICE", device }),
    [],
  );
  const resetDraft = useCallback(() => dispatch({ type: "RESET" }), []);

  const value = useMemo(
    () => ({
      draft,
      updateExperimentDetails,
      setVariants,
      updateVariant,
      addVariant,
      removeVariant,
      setDetectedTarget,
      confirmTarget,
      setPilotSize,
      setBehaviourDiversity,
      setDevice,
      resetDraft,
    }),
    [
      draft,
      updateExperimentDetails,
      setVariants,
      updateVariant,
      addVariant,
      removeVariant,
      setDetectedTarget,
      confirmTarget,
      setPilotSize,
      setBehaviourDiversity,
      setDevice,
      resetDraft,
    ],
  );

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useDraft(): DraftContextValue {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error("useDraft must be used within a DraftProvider");
  return ctx;
}
