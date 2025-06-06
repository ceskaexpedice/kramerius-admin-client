import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { LoginComponent } from './pages/account/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { ObjectComponent } from './pages/access/object/object.component';
import { AccessComponent } from './pages/access/access.component';
import { ImportComponent } from './pages/import/import.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { CdkComponent } from './pages/cdk/cdk.component';
import { CdkProxyDetailComponent } from './pages/cdk/cdk-proxy/cdk-proxy-detail/cdk-proxy-detail.component';
import { DevComponent } from './pages/dev/dev.component';
import { ProcessesComponent } from './pages/processes/processes.component';
import { ProcessComponent } from './pages/processes/process/process.component';
import { CollectionsComponent } from './pages/collections/collections.component';
import { CollectionNewComponent } from './pages/collections/collection-new/collection-new.component';
import { CollectionComponent } from './pages/collections/collection/collection.component';
import { IndexingComponent } from './pages/indexing/indexing.component';
import { ConfigComponent } from './components/config/config.component';
import { RepositoryComponent } from './pages/repository/repository.component';
import { CdkCollectionNewComponent } from './pages/cdk-collections/cdk-collection-new/cdk-collection-new.component';
import { CdkCollectionComponent } from './pages/cdk-collections/cdk-collection/cdk-collection.component';
import { CdkCollectionsComponent } from './pages/cdk-collections/cdk-collections.component';
import { MonitoringComponent } from './pages/monitoring/monitoring.component';

export const routes: Routes = [
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
  { path: 'repository/oai', component: RepositoryComponent, canActivate: [AuthGuard] },
  { path: 'repository/cdk', component: RepositoryComponent, canActivate: [AuthGuard] },
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
  { path: 'cdk/object-reharvest', component: CdkComponent, canActivate: [AuthGuard] },
  { path: 'cdk/proxy/detail/:id', component: CdkProxyDetailComponent, canActivate: [AuthGuard] },
  { path: 'cdk/europeanou', component: CdkComponent, canActivate: [AuthGuard] },
  
  { path: 'cdk-collections', redirectTo: 'cdk-collections/cdk'},
  { path: 'cdk-collections/new', component: CdkCollectionNewComponent, canActivate: [AuthGuard] },
  { path: 'cdk-collections/detail/:id', component: CdkCollectionComponent, canActivate: [AuthGuard] },
  { path: 'cdk-collections/edit/:id', component: CdkCollectionComponent, canActivate: [AuthGuard] },
  { path: 'cdk-collections/content/:id', component: CdkCollectionComponent, canActivate: [AuthGuard] },
  { path: 'cdk-collections/context/:id', component: CdkCollectionComponent, canActivate: [AuthGuard] },
  { path: 'cdk-collections/cdk', component: CdkCollectionsComponent, canActivate: [AuthGuard] },
  { path: 'cdk-collections/diglib', component: CdkCollectionsComponent, canActivate: [AuthGuard] },

  { path: 'monitoring', redirectTo: 'monitoring/api' },
  { path: 'monitoring/api', component: MonitoringComponent, canActivate: [AuthGuard] },

  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] }
];
