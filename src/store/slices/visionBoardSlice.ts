import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { VisionBoard, VisionItem, VisionItemStatus } from '../../types';
import { v4 as uuid } from 'uuid';

interface VisionBoardState {
  boards: VisionBoard[];
  activeBoardId: string | null;
}

const initialState: VisionBoardState = {
  boards: [],
  activeBoardId: null,
};

const visionBoardSlice = createSlice({
  name: 'visionBoard',
  initialState,
  reducers: {
    createBoard: (state, action: PayloadAction<{ name: string; background?: string }>) => {
      const newBoard: VisionBoard = {
        id: uuid(),
        name: action.payload.name,
        background: action.payload.background ?? 'starfield',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.boards.push(newBoard);
      state.activeBoardId = newBoard.id;
    },
    deleteBoard: (state, action: PayloadAction<string>) => {
      state.boards = state.boards.filter((b) => b.id !== action.payload);
      if (state.activeBoardId === action.payload) {
        state.activeBoardId = state.boards[0]?.id ?? null;
      }
    },
    setActiveBoard: (state, action: PayloadAction<string>) => {
      state.activeBoardId = action.payload;
    },
    renameBoard: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const b = state.boards.find((b) => b.id === action.payload.id);
      if (b) b.name = action.payload.name;
    },
    addItem: (
      state,
      action: PayloadAction<{ boardId: string; item: Omit<VisionItem, 'id' | 'boardId'> }>
    ) => {
      const b = state.boards.find((b) => b.id === action.payload.boardId);
      if (b) {
        b.items.push({ ...action.payload.item, id: uuid(), boardId: action.payload.boardId });
        b.updatedAt = new Date().toISOString();
      }
    },
    updateItem: (
      state,
      action: PayloadAction<{ boardId: string; itemId: string; updates: Partial<VisionItem> }>
    ) => {
      const b = state.boards.find((b) => b.id === action.payload.boardId);
      if (b) {
        const idx = b.items.findIndex((i) => i.id === action.payload.itemId);
        if (idx >= 0) {
          b.items[idx] = { ...b.items[idx], ...action.payload.updates };
          b.updatedAt = new Date().toISOString();
        }
      }
    },
    removeItem: (state, action: PayloadAction<{ boardId: string; itemId: string }>) => {
      const b = state.boards.find((b) => b.id === action.payload.boardId);
      if (b) {
        b.items = b.items.filter((i) => i.id !== action.payload.itemId);
        b.updatedAt = new Date().toISOString();
      }
    },
    setItemStatus: (
      state,
      action: PayloadAction<{ boardId: string; itemId: string; status: VisionItemStatus }>
    ) => {
      const b = state.boards.find((b) => b.id === action.payload.boardId);
      if (b) {
        const item = b.items.find((i) => i.id === action.payload.itemId);
        if (item) item.status = action.payload.status;
      }
    },
    loadBoards: (state, action: PayloadAction<VisionBoard[]>) => {
      state.boards = action.payload;
      if (!state.activeBoardId && action.payload.length > 0) {
        state.activeBoardId = action.payload[0].id;
      }
    },
  },
});

export const {
  createBoard, deleteBoard, setActiveBoard, renameBoard,
  addItem, updateItem, removeItem, setItemStatus, loadBoards,
} = visionBoardSlice.actions;
export default visionBoardSlice.reducer;
