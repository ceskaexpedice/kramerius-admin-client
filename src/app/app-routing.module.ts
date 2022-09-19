import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProcessesComponent } from './components/processes/processes.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/account/login/login.component';
import { ProcessComponent } from './components/processes/process/process.component';
import { CollectionsComponent } from './components/collections/collections.component';
import { CollectionEditComponent } from './components/collections/collection-edit/collection-edit.component';
import { CollectionComponent } from './components/collections/collection/collection.component';
import { DevComponent } from './components/dev/dev.component';
import { IndexingComponent } from './components/indexing/indexing.component';
import { ConfigComponent } from './components/config/config.component';
import { RepositoryComponent } from './components/repository/repository.component';
import { AccessComponent } from './components/access/access.component';
import { ImportComponent } from './components/import/import.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { AuthComponent } from './components/auth/auth.component';
import { ObjectComponent } from './components/access/object/object.component';
import { CollectionNewComponent } from './components/collections/collection-new/collection-new.component';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'keycloak', component: AuthComponent },
  { path: 'dev', component: DevComponent, canActivate: [AuthGuard] },
  { path: 'processes/:id', component: ProcessComponent, canActivate: [AuthGuard] },
  { path: 'processes', component: ProcessesComponent, canActivate: [AuthGuard] },
  { path: 'collections/:id/edit', component: CollectionEditComponent, canActivate: [AuthGuard] },
  { path: 'collections/new', component: CollectionNewComponent, canActivate: [AuthGuard] },
  { path: 'collections/:id', component: CollectionComponent, canActivate: [AuthGuard] },
  { path: 'collections', component: CollectionsComponent, canActivate: [AuthGuard] },
  { path: 'indexing', redirectTo: 'indexing/object' },
  { path: 'indexing/object', component: IndexingComponent, canActivate: [AuthGuard] },
  { path: 'indexing/model', component: IndexingComponent, canActivate: [AuthGuard] },
  { path: 'config', component: ConfigComponent, canActivate: [AuthGuard] },
  { path: 'repository', redirectTo: 'repository/repository-management' },
  { path: 'repository/repository-management', component: RepositoryComponent, canActivate: [AuthGuard] },
  { path: 'repository/exports', component: RepositoryComponent, canActivate: [AuthGuard] },
  { path: 'repository/bulk-data-editing', component: RepositoryComponent, canActivate: [AuthGuard] },
  { path: 'repository/statistics', component: RepositoryComponent, canActivate: [AuthGuard] },
  { path: 'object', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'object/actions/:pid', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'object/accessibility/:pid', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'object/in-collections/:pid', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'object/others/:pid', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'access', redirectTo: 'access/rights' },
  { path: 'access/rights', component: AccessComponent, canActivate: [AuthGuard] },
  { path: 'access/roles', component: AccessComponent, canActivate: [AuthGuard] },
  { path: 'access/licenses', component: AccessComponent, canActivate: [AuthGuard] },
  { path: 'access/params', component: AccessComponent, canActivate: [AuthGuard] },
  { path: 'import', redirectTo: 'import/foxml' },
  { path: 'import/foxml', component: ImportComponent, canActivate: [AuthGuard] },
  { path: 'import/ndk', component: ImportComponent, canActivate: [AuthGuard] },
  { path: 'statistics', redirectTo: 'statistics/graphs' },
  { path: 'statistics/graphs', component: StatisticsComponent, canActivate: [AuthGuard] },
  { path: 'statistics/most-viewed-documents', component: StatisticsComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
