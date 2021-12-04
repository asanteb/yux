import * as ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ArwesThemeProvider, StylesBaseline } from "@arwes/core";
import Home from "./Home";
import Header from "./components/Header";

const ROOT_FONT_FAMILY = '"Titillium Web", sans-serif';

ReactDOM.render(
  <ArwesThemeProvider>
    <StylesBaseline styles={{ body: { fontFamily: ROOT_FONT_FAMILY } }} />
    <Header />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </ArwesThemeProvider>,
  document.getElementById("app")
);
