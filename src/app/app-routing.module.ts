import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProcessesComponent } from './components/processes/processes.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/account/login/login.component';
import { ProcessComponent } from './components/processes/process/process.component';
import { CollectionsComponent } from './components/collections/collections.component';
import { EditCollectionComponent } from './components/collections/edit-collection/edit-collection.component';
import { CollectionComponent } from './components/collections/collection/collection.component';
import { DevComponent } from './components/dev/dev.component';
import { IndexingComponent } from './components/indexing/indexing.component';
import { ConfigComponent } from './components/config/config.component';
import { RepositoryComponent } from './components/repository/repository.component';
import { AccessComponent } from './components/access/access.component';
import { ImportComponent } from './components/import/import.component';
import { ObjectAccessComponent } from './components/access/object-access/object-access.component';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'dev', component: DevComponent, canActivate: [AuthGuard] },
  { path: 'processes/:id', component: ProcessComponent, canActivate: [AuthGuard] },
  { path: 'processes', component: ProcessesComponent, canActivate: [AuthGuard] },
  { path: 'collections/:id/edit', component: EditCollectionComponent, canActivate: [AuthGuard] },
  { path: 'collections/new', component: EditCollectionComponent, canActivate: [AuthGuard] },
  { path: 'collections/:id', component: CollectionComponent, canActivate: [AuthGuard] },
  { path: 'collections', component: CollectionsComponent, canActivate: [AuthGuard] },
  { path: 'indexing', component: IndexingComponent, canActivate: [AuthGuard] },
  { path: 'config', component: ConfigComponent, canActivate: [AuthGuard] },
  { path: 'repository', component: RepositoryComponent, canActivate: [AuthGuard] },
  { path: 'rights/:pid', component: ObjectAccessComponent, canActivate: [AuthGuard] },
  { path: 'rights', component: AccessComponent, canActivate: [AuthGuard] },
  { path: 'import', component: ImportComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
