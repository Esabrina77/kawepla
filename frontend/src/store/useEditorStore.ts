import { create } from 'zustand';
import * as fabric from 'fabric';

interface EditorState {
    canvas: fabric.Canvas | null;
    setCanvas: (canvas: fabric.Canvas) => void;

    backgroundColor: string;
    setBackgroundColor: (color: string) => void;

    selectedObjects: fabric.Object[];
    setSelectedObjects: (objects: fabric.Object[]) => void;

    zoom: number;
    setZoom: (zoom: number) => void;

    format: { width: number; height: number; name: string };
    setFormat: (format: { width: number; height: number; name: string }) => void;

    history: string[];
    historyIndex: number;
    saveHistory: () => void;
    undo: () => void;
    redo: () => void;
    isHistoryProcessing: boolean;
    savedColors: string[];
    addSavedColor: (color: string) => void;

    gridEnabled: boolean;
    toggleGrid: () => void;

    drawingMode: boolean;
    setDrawingMode: (enabled: boolean) => void;

    activeSidebarTab: string;
    setActiveSidebarTab: (tab: string) => void;

    loading: boolean;
    setLoading: (loading: boolean) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
    canvas: null,
    setCanvas: (canvas) => set({ canvas }),

    backgroundColor: '#ffffff',
    // ... (rest should be the same, but let's just insert)
    loading: false,
    setLoading: (loading) => set({ loading }),
    setBackgroundColor: (color) => {
        set({ backgroundColor: color });
        const { canvas } = get();
        if (canvas) {
            canvas.backgroundColor = color;
            canvas.requestRenderAll();
            get().saveHistory();
        }
    },

    selectedObjects: [],
    setSelectedObjects: (selectedObjects) => set({ selectedObjects }),

    zoom: 1,
    setZoom: (zoom) => set({ zoom }),

    format: { width: 524, height: 742, name: 'custom' },
    setFormat: (format) => {
        set({ format });
        const { canvas, zoom } = get();
        if (canvas) {
            canvas.setWidth(format.width   * zoom);
            canvas.setHeight(format.height * zoom);
            canvas.requestRenderAll();
            get().saveHistory();
        }
    },

    history: [],
    historyIndex: -1,
    isHistoryProcessing: false,
    saveHistory: () => {
        const { canvas, history, historyIndex, isHistoryProcessing } = get();
        if (!canvas || isHistoryProcessing) return;

        // On n'inclut pas tout car toJSON est lourd, mais on doit avoir les dimensions et le fond
        const json = JSON.stringify((canvas as any).toJSON(['width', 'height', 'backgroundColor']));
        
        // Éviter de sauvegarder deux fois le même état consécutif
        if (historyIndex >= 0 && history[historyIndex] === json) return;

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(json);
        
        // Limiter la taille de l'historique à 50 étapes
        if (newHistory.length > 50) {
            newHistory.shift();
        }

        set({ 
            history: newHistory, 
            historyIndex: newHistory.length - 1 
        });
    },
    undo: () => {
        const { canvas, history, historyIndex } = get();
        if (!canvas || historyIndex <= 0) return;

        const prevIndex = historyIndex - 1;
        const json = history[prevIndex];

        set({ isHistoryProcessing: true });
        canvas.loadFromJSON(JSON.parse(json), () => {
            canvas.requestRenderAll();
            set({ historyIndex: prevIndex, isHistoryProcessing: false });
        });
    },
    redo: () => {
        const { canvas, history, historyIndex } = get();
        if (!canvas || historyIndex >= history.length - 1) return;

        const nextIndex = historyIndex + 1;
        const json = history[nextIndex];

        set({ isHistoryProcessing: true });
        canvas.loadFromJSON(JSON.parse(json), () => {
            canvas.requestRenderAll();
            set({ historyIndex: nextIndex, isHistoryProcessing: false });
        });
    },

    savedColors: ['#000000', '#ffffff', '#ef4444', '#3b82f6', '#22c55e', '#eab308'],
    addSavedColor: (color) => set((state) => {
        if (state.savedColors.includes(color)) return state;
        return { savedColors: [...state.savedColors, color] };
    }),

    gridEnabled: false,
    toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),

    drawingMode: false,
    setDrawingMode: (enabled) => {
        set({ drawingMode: enabled });
        const { canvas } = get();
        if (canvas) {
            canvas.isDrawingMode = enabled;
            if (enabled) {
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                canvas.freeDrawingBrush.width = 5;
                canvas.freeDrawingBrush.color = '#000000';
            }
        }
    },

    activeSidebarTab: 'templates',
    setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
}));

