import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import './App.css';
import './animate.css';
import Menu from './Menu';

const App = ({history}) => (
    <Router history={history}>
      <div className="App">
        <Switch>
          <Route path="/" component={Menu} />
        </Switch> 
      </div>   
    </Router>
  );

export default App;
