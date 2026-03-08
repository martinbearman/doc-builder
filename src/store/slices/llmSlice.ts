import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  highlightedBlockIds: [] as string[],
  suggestionsByBlockId: {} as Record<string, string>,
  lastResponse: null as string | null,
};

export const llmSlice = createSlice({
  name: "llm",
  initialState,
  reducers: {
    setHighlight(
      state,
      action: PayloadAction<{
        blockIds: string[];
        suggestions?: Record<string, string>;
      }>
    ) {
      state.highlightedBlockIds = action.payload.blockIds;
      state.suggestionsByBlockId = action.payload.suggestions ?? {};
    },
    clearSuggestions(state) {
      state.highlightedBlockIds = [];
      state.suggestionsByBlockId = {};
    },
    setLastResponse(state, action: PayloadAction<string | null>) {
      state.lastResponse = action.payload;
    },
  },
});

export const { setHighlight, clearSuggestions, setLastResponse } =
  llmSlice.actions;

export default llmSlice.reducer;
