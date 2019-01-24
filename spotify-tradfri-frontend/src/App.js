import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';
import Home from './Home.js';
import Config from './Config.js';
import Playing from './Playing.js';

class App extends Component {
  render() {
    return (
        <Switch>
          <Route exact path='/' component={Home}/>
          <Route path='/config' component={Config}/>
          <Route path='/playing' component={Playing}/>
        </Switch>
    );
  }
}

export default App;
