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
import AdminDashboard from './pages/app/admin/dashboard.jsx';
import AdminAccount from './pages/app/admin/account.jsx';
import AdminProject from './pages/app/admin/project.jsx';
import AdminProjectList from './pages/app/admin/project/list.jsx';
import AdminProjectListDetails from './pages/app/admin/project/list/details.jsx';
import ExaminerDashboard from './pages/app/examiner/dashboard.jsx';
import ExaminerAccount from './pages/app/examiner/account.jsx';
import ExaminerProject from './pages/app/examiner/project.jsx';
import ExaminerProjectList from './pages/app/examiner/project/list.jsx';
import ExaminerProjectListDetails from './pages/app/examiner/project/list/details.jsx';
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
        path="/realization"
        component={() => <Intro section="realization" />}
      ></Route>
      <Route
        path="/supporters"
        component={() => <Intro section="supporters" />}
      ></Route>
      <Route
        path="/sponsors"
        component={() => <Intro section="sponsorsDiamond" />}
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

        {/* Admin routes */}
        <Route path="/admin">
          <Route path="/dashboard" component={AdminDashboard}></Route>
          <Route path="/project">
            <Route path="/" component={AdminProject}></Route>
            <Route path="/list">
              <Route path="/" component={AdminProjectList}></Route>
              <Route
                path="/details"
                component={AdminProjectListDetails}
              ></Route>
            </Route>
          </Route>
          <Route path="/account" component={AdminAccount}></Route>
        </Route>

        {/* Examiner routes */}
        <Route path="/examiner">
          <Route path="/dashboard" component={ExaminerDashboard}></Route>
          <Route path="/project">
            <Route path="/" component={ExaminerProject}></Route>
            <Route path="/list">
              <Route path="/" component={ExaminerProjectList}></Route>
              <Route
                path="/details"
                component={ExaminerProjectListDetails}
              ></Route>
            </Route>
          </Route>
          <Route path="/account" component={ExaminerAccount}></Route>
        </Route>

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
        </Route>

        {/* Support */}
        <Route path="/support" component={Support}></Route>
      </Route>

      {/* 404 route */}
      <Route path="*" component={NoMatch} />
    </Router>
  ),
  root,
);
