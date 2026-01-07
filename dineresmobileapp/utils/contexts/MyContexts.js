import { createContext } from "react";

export const MyUserContext = createContext([null, () => {}]);

export const ViewModeContext = createContext([false, () => {}]);

export const MyCartContext = createContext([null, () => []])