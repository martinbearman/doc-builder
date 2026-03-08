import { configureStore } from "@reduxjs/toolkit";
import documentReducer from "./slices/documentSlice";
import contextModeReducer from "./slices/contextModeSlice";
import contextBucketReducer from "./slices/contextBucketSlice";
import llmReducer from "./slices/llmSlice";

export const store = configureStore({
  reducer: {
    document: documentReducer,
    contextMode: contextModeReducer,
    contextBucket: contextBucketReducer,
    llm: llmReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
