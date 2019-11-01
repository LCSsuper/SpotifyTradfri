import React from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';
import Home from '../Home';
import Config from '../Config';
import Playing from '../Playing';

const App = () => (
    <Switch>
      <Route exact path='/' component={Home}/>
      <Route path='/config' component={Config}/>
      <Route path='/playing' component={Playing}/>
    </Switch>
);

export default App;
