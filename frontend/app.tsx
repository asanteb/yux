import * as ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ArwesThemeProvider, StylesBaseline } from "@arwes/core";
import Home from "./Home";
import Header from "./components/Header";
import Room from "./Room";
import appStore from "./store";

const ROOT_FONT_FAMILY = '"Titillium Web", sans-serif';

const MainView = () => {
  appStore.initProfile();
  return (
    <ArwesThemeProvider>
      <StylesBaseline styles={{ body: { fontFamily: ROOT_FONT_FAMILY } }} />
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room" element={<Room />} />
        </Routes>
      </BrowserRouter>
    </ArwesThemeProvider>
  );
};

ReactDOM.render(<MainView />, document.getElementById("app"));
