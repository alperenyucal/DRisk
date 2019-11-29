import React from "react";
import { render } from "react-dom";
import "./pages/Home";
import Home from "./pages/Home";
import Game from "./pages/Game";
import MapEditor from "./pages/MapEditor";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";


render((
  <Router>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/game" component={Game} />
      <Route exact path="/mapeditor" component={MapEditor} />
      <Route exact path="*">404</Route>
    </Switch>
  </Router>
), document.getElementById('root'));
