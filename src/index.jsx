import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import './styles/index.css';

// Website pages
import Intro from './pages/website/intro.jsx';

// App pages
import SignIn from './pages/app/signin.jsx';
import SignUp from './pages/app/signup.jsx';
import EmailConfirmation from './pages/app/email-confirmation.jsx';
import PasswordRecovery from './pages/app/password-recovery.jsx';
import PasswordReset from './pages/app/password-reset.jsx';
import Support from './pages/app/support.jsx';
import ParticipantDashboard from './pages/app/participant/dashboard.jsx';
import ParticipantProject from './pages/app/participant/project.jsx';
import ParticipantProjectCreate from './pages/app/participant/project/create.jsx';
import ParticipantProjectList from './pages/app/participant/project/list.jsx';
import ParticipantProjectListDetails from './pages/app/participant/project/list/details.jsx';
import ParticipantAccount from './pages/app/participant/account.jsx';

// 404 page
import NoMatch from './pages/no-match.jsx';

const root = document.getElementById('root');

render(
  () => (
    <Router>
      {/* Website routes */}
      <Route path="/" component={Intro}></Route>
      <Route path="/event" component={() => <Intro section="event" />}></Route>
      <Route
        path="/organization"
        component={() => <Intro section="organization" />}
      ></Route>
      <Route
        path="/support"
        component={() => <Intro section="support" />}
      ></Route>
      <Route
        path="/sponsors"
        component={() => <Intro section="sponsors" />}
      ></Route>
      <Route path="/certificates" component={Intro}></Route>

      {/* App routes */}
      <Route path="/app">
        <Route path="/" component={SignIn}></Route>
        <Route path="/signin" component={SignIn}></Route>
        <Route path="/signup" component={SignUp}></Route>
        <Route path="/email-confirmation" component={EmailConfirmation}></Route>
        <Route path="/password-recovery" component={PasswordRecovery}></Route>
        <Route path="/password-reset" component={PasswordReset}></Route>

        {/* Participant routes */}
        <Route path="/participant">
          <Route path="/dashboard" component={ParticipantDashboard}></Route>
          <Route path="/project">
            <Route path="/" component={ParticipantProject}></Route>
            <Route path="/create" component={ParticipantProjectCreate}></Route>
            <Route path="/list">
              <Route path="/" component={ParticipantProjectList}></Route>
              <Route
                path="/details"
                component={ParticipantProjectListDetails}
              ></Route>
            </Route>
          </Route>
          <Route path="/account" component={ParticipantAccount}></Route>
          <Route path="/support" component={Support}></Route>
        </Route>
      </Route>
      {/* 404 route */}
      <Route path="*" component={NoMatch} />
    </Router>
  ),
  root,
);
