import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Component imports
import { AppComponent } from './app.component';
import { HeaderComponent } from './core/header/header.component';
import { HomeComponent } from './pages/home/home.component';
import { PostDetailComponent } from './pages/post-detail/post-detail.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { PostCardComponent } from './shared/post-card/post-card.component';
import { CreatePostComponent } from './pages/create-post/create-post.component';
import { AppRoutingModule } from './app-routing.module';
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


@NgModule({ declarations: [
        AppComponent,
        HeaderComponent,
        HomeComponent,
        PostDetailComponent,
        ProfileComponent,
        PostCardComponent,
        CreatePostComponent,
        ReadingListComponent,
        TagsComponent,
        AboutComponent,
        SettingsComponent,
        ListingsComponent,
        PodcastsComponent,
        VideosComponent,
        LoginComponent,
        RegisterComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        NotFoundComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
