import React from "react";
import { render } from "react-dom";
import "./pages/HomePage";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import EditorPage from "./pages/EditorPage";

import { BrowserRouter as Router, Route, Switch} from "react-router-dom";

render((
  <Router>
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route exact path="/play" component={GamePage} />
      <Route exact path="/mapeditor" component={EditorPage} />
    </Switch>
  </Router>
), document.getElementById('root'));
