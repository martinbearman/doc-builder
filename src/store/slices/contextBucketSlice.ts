import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ContextBucketItem } from "@/types/context";

const initialState = {
  items: [] as ContextBucketItem[],
};

export const contextBucketSlice = createSlice({
  name: "contextBucket",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<Omit<ContextBucketItem, "id">>) {
      state.items.push({
        ...action.payload,
        id: crypto.randomUUID(),
      });
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    setResolvedText(
      state,
      action: PayloadAction<{ id: string; text: string }>
    ) {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.resolvedText = action.payload.text;
    },
  },
});

export const { addItem, removeItem, setResolvedText } =
  contextBucketSlice.actions;

export default contextBucketSlice.reducer;
