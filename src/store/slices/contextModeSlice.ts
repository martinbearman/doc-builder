import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  contextModeEnabled: false,
  selectedBlockIds: [] as string[],
};

export const contextModeSlice = createSlice({
  name: "contextMode",
  initialState,
  reducers: {
    toggleContextMode(state) {
      state.contextModeEnabled = !state.contextModeEnabled;
      if (!state.contextModeEnabled) state.selectedBlockIds = [];
    },
    setContextMode(state, action: PayloadAction<boolean>) {
      state.contextModeEnabled = action.payload;
      if (!action.payload) state.selectedBlockIds = [];
    },
    toggleBlockSelection(state, action: PayloadAction<string>) {
      const idx = state.selectedBlockIds.indexOf(action.payload);
      if (idx === -1) state.selectedBlockIds.push(action.payload);
      else state.selectedBlockIds.splice(idx, 1);
    },
    clearSelection(state) {
      state.selectedBlockIds = [];
    },
  },
});

export const {
  toggleContextMode,
  setContextMode,
  toggleBlockSelection,
  clearSelection,
} = contextModeSlice.actions;

export default contextModeSlice.reducer;
