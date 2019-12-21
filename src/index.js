import React from "react";
import { render } from "react-dom";
import "./pages/Home";
import Home from "./pages/Home";
import Game from "./pages/Game";
import MapEditor from "./pages/MapEditor";
import MapTest from "./pages/MapTest";
import ChatDemo from "./pages/ChatDemo";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";

import io from "socket.io-client";
const socket = io();

render((
  <Router>
    <Switch>
      <Route exact path="/" render={(props)=><Home {...props} io={io} socket={socket} />} />
      <Route exact path="/game" component={Game} />
      <Route exact path="/mapeditor" component={MapEditor} />
      <Route exact path="/chatdemo" render={(props)=><ChatDemo {...props} io={io} socket={socket} />} />
      <Route exact path="*">404</Route>
    </Switch>
  </Router>
), document.getElementById('root'));
