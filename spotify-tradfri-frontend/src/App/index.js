import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';
import Home from '../Home';
import Config from '../Config';
import Playing from '../Playing';

/**
 * The React Router with the three pages
 */
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
