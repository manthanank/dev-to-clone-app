import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PostDetailComponent } from './pages/post-detail/post-detail.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CreatePostComponent } from './pages/create-post/create-post.component';
import { ReadingListComponent } from './pages/reading-list/reading-list.component';
import { TagsComponent } from './pages/tags/tags.component';
import { AboutComponent } from './pages/about/about.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ListingsComponent } from './pages/listings/listings.component';
import { PodcastsComponent } from './pages/podcasts/podcasts.component';
import { VideosComponent } from './pages/videos/videos.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AuthGuard } from './core/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'post/:id', component: PostDetailComponent },
  { path: 'user/:username', component: ProfileComponent },
  { path: 'new', component: CreatePostComponent, canActivate: [AuthGuard] },
  { path: 'reading-list', component: ReadingListComponent },
  { path: 'tags', component: TagsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'listings', component: ListingsComponent },
  { path: 'podcasts', component: PodcastsComponent },
  { path: 'videos', component: VideosComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
