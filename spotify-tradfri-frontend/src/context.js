import { createContext } from "react";

import configStore from "./Config/store";
import homeStore from "./Home/store";
import playingStore from "./Playing/store";

const context = createContext({
    configStore,
    homeStore,
    playingStore
});

export default context;
