import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./auth/welcome/welcome.module').then( m => m.WelcomePageModule)
  },
  {
    path: 'signin',
    loadChildren: () => import('./auth/signin/signin.module').then(m => m.SigninPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./auth/signup/signup.module').then(m => m.SignupPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
