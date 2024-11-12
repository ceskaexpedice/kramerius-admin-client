import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { LoginComponent } from './pages/account/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { ObjectComponent } from './pages/access/object/object.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'keycloak', component: AuthComponent },
  { path: 'object', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'object/:pid', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'object/:pid/actions', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'object/:pid/accessibility', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'object/:pid/in-collections', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'object/:pid/others', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'object/:pid/editing', component: ObjectComponent, canActivate: [AuthGuard] },
];
