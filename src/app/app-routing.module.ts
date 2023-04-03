import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProcessesComponent } from './pages/processes/processes.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/account/login/login.component';
import { ProcessComponent } from './pages/processes/process/process.component';
import { CollectionsComponent } from './pages/collections/collections.component';
import { CollectionEditComponent } from './pages/collections/collection-edit/collection-edit.component';
import { CollectionComponent } from './pages/collections/collection/collection.component';
import { DevComponent } from './pages/dev/dev.component';
import { IndexingComponent } from './pages/indexing/indexing.component';
import { ConfigComponent } from './components/config/config.component';
import { RepositoryComponent } from './pages/repository/repository.component';
import { AccessComponent } from './pages/access/access.component';
import { ImportComponent } from './pages/import/import.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { AuthComponent } from './components/auth/auth.component';
import { ObjectComponent } from './pages/access/object/object.component';
import { CollectionNewComponent } from './pages/collections/collection-new/collection-new.component';
import { CdkComponent } from './pages/cdk/cdk.component';
import { CdkProxyDetailComponent } from './pages/cdk/cdk-proxy/cdk-proxy-detail/cdk-proxy-detail.component';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'keycloak', component: AuthComponent },
  { path: 'dev', component: DevComponent, canActivate: [AuthGuard] },
  { path: 'processes', component: ProcessesComponent, canActivate: [AuthGuard] },
  { path: 'processes/standard-output/:id', component: ProcessComponent, canActivate: [AuthGuard] },
  { path: 'processes/error-output/:id', component: ProcessComponent, canActivate: [AuthGuard] },
  { path: 'collections', component: CollectionsComponent, canActivate: [AuthGuard] },
  { path: 'collections/new', component: CollectionNewComponent, canActivate: [AuthGuard] },
  { path: 'collections/detail/:id', component: CollectionComponent, canActivate: [AuthGuard] },
  { path: 'collections/edit/:id', component: CollectionComponent, canActivate: [AuthGuard] },
  { path: 'collections/content/:id', component: CollectionComponent, canActivate: [AuthGuard] },
  { path: 'collections/context/:id', component: CollectionComponent, canActivate: [AuthGuard] },
  { path: 'indexing', redirectTo: 'indexing/object' },
  { path: 'indexing/object', component: IndexingComponent, canActivate: [AuthGuard] },
  { path: 'indexing/model', component: IndexingComponent, canActivate: [AuthGuard] },
  { path: 'config', component: ConfigComponent, canActivate: [AuthGuard] },
  { path: 'repository', redirectTo: 'repository/repository-management' },
  { path: 'repository/repository-management', component: RepositoryComponent, canActivate: [AuthGuard] },
  { path: 'repository/exports', component: RepositoryComponent, canActivate: [AuthGuard] },
  { path: 'repository/bulk-data-editing', component: RepositoryComponent, canActivate: [AuthGuard] },
  /* to delete after testing { path: 'repository/statistics', component: RepositoryComponent, canActivate: [AuthGuard] }, */
  { path: 'object', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'object/:pid', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'object/:pid/actions', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'object/:pid/accessibility', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'object/:pid/in-collections', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'object/:pid/others', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'object/:pid/editing', component: ObjectComponent, canActivate: [AuthGuard] },
  { path: 'access', redirectTo: 'access/actions' },
  { path: 'access/actions', component: AccessComponent, canActivate: [AuthGuard] },
  { path: 'access/roles', component: AccessComponent, canActivate: [AuthGuard] },
  { path: 'access/licenses', component: AccessComponent, canActivate: [AuthGuard] },
  { path: 'access/params', component: AccessComponent, canActivate: [AuthGuard] },
  { path: 'import', redirectTo: 'import/foxml' },
  { path: 'import/foxml', component: ImportComponent, canActivate: [AuthGuard] },
  { path: 'import/ndk', component: ImportComponent, canActivate: [AuthGuard] },
  { path: 'statistics', redirectTo: 'statistics/graphs' },
  { path: 'statistics/graphs', component: StatisticsComponent, canActivate: [AuthGuard] },
  { path: 'statistics/most-viewed-documents', component: StatisticsComponent, canActivate: [AuthGuard] },
  { path: 'statistics/generating-logs-for-nk', component: StatisticsComponent, canActivate: [AuthGuard] },
  { path: 'cdk', redirectTo: 'cdk/proxy'},
  { path: 'cdk/proxy', component: CdkComponent, canActivate: [AuthGuard] },
  { path: 'cdk/proxy/detail/:id', component: CdkProxyDetailComponent, canActivate: [AuthGuard] },
  { path: 'cdk/europeanou', component: CdkComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
